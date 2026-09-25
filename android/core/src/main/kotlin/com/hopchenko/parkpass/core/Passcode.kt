package com.hopchenko.parkpass.core

import java.time.DateTimeException
import java.time.LocalDate
import java.time.temporal.ChronoUnit

/**
 * Transfer codes: the whole pin board packs into a string you paste on another
 * device. A line-for-line port of parkpass-web/src/lib/passcode.ts — the two
 * must agree bit for bit, which PasscodeTest proves against vectors produced
 * by the web codec. Wire format: docs/specs/transfer-codes.md.
 *
 *   [4 bits version][W bits presence bitmap][14 bits × each set bit]
 */
object Passcode {
    /**
     * Frozen slug order — codes are positional, so this list is APPEND-ONLY.
     * Reordering or deleting an entry silently redirects every code already
     * written down to the wrong parks.
     */
    val CODE_ORDER: List<String> = listOf(
        "abisko",
        "vadvetjakka",
        "stora-sjofallet",
        "padjelanta",
        "sarek",
        "muddus",
        "pieljekaise",
        "haparanda-skargard",
        "bjornlandet",
        "skuleskogen",
        "sonfjallet",
        "tofsingdalen",
        "fulufjallet",
        "hamra",
        "farnebofjarden",
        "garphyttan",
        "tyresta",
        "angso",
        "namdoskargarden",
        "norra-kvill",
        "store-mosse",
        "bla-jungfrun",
        "gotska-sandon",
        "asnen",
        "stenshuvud",
        "dalby-soderskog",
        "soderasen",
        "kosterhavet",
        "tiveden",
        "djuro",
        "tresticklan",
    )

    private const val VERSION = 1
    private const val VERSION_BITS = 4

    /** Bitmap width per version. A 32nd park means a version 2 — never widen 1. */
    private val BITMAP_WIDTH = mapOf(1 to 31)

    private const val DATE_BITS = 14
    private const val MAX_DAY = (1 shl DATE_BITS) - 1

    /** Reserved: "pinned, but the stored date was unreadable". */
    private const val UNKNOWN_DAY = 0
    private val EPOCH: LocalDate = LocalDate.of(2020, 1, 1)

    /** Crockford base32 — no I, L, O or U, so 1/I and 0/O can't be fat-fingered. */
    private const val ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
    private const val PREFIX = "PARKPASS"
    private const val CHECKSUM_CHARS = 2
    private const val CHECKSUM_BITS = 10

    private val CHAR_VALUES: Map<Char, Int> = buildMap {
        ALPHABET.forEachIndexed { i, ch -> put(ch, i) }
        // Crockford's forgiving aliases for the characters it dropped.
        put('O', 0)
        put('I', 1)
        put('L', 1)
    }

    private val ISO_DATE = Regex("""^(\d{4})-(\d{2})-(\d{2})$""")

    init {
        check(CODE_ORDER.size == BITMAP_WIDTH.getValue(VERSION)) {
            "CODE_ORDER has ${CODE_ORDER.size} entries but version $VERSION encodes " +
                "${BITMAP_WIDTH[VERSION]}. Add a new version rather than widening this one."
        }
    }

    enum class DecodeError { EMPTY, CHARSET, LENGTH, CHECKSUM, VERSION }

    sealed interface DecodeResult {
        data class Ok(val visits: VisitedMap) : DecodeResult
        data class Error(val error: DecodeError) : DecodeResult
    }

    private fun MutableList<Int>.pushBits(value: Int, width: Int) {
        for (i in width - 1 downTo 0) add((value ushr i) and 1)
    }

    private fun List<Int>.readBits(offset: Int, width: Int): Int {
        var value = 0
        for (i in 0 until width) value = (value shl 1) or this[offset + i]
        return value
    }

    /**
     * CRC-16/CCITT-FALSE over the code's 5-bit values, so the check is
     * independent of the payload layout — a code from a future version still
     * fails on its version, not on a bogus checksum.
     */
    private fun crc16(values: List<Int>): Int {
        var crc = 0xFFFF
        for (value in values) {
            crc = crc xor ((value shl 8) and 0xFFFF)
            repeat(8) {
                crc = if (crc and 0x8000 != 0) {
                    ((crc shl 1) xor 0x1021) and 0xFFFF
                } else {
                    (crc shl 1) and 0xFFFF
                }
            }
        }
        return crc
    }

    private fun dayFromIso(iso: String): Int {
        val m = ISO_DATE.matchEntire(iso) ?: return UNKNOWN_DAY
        val (y, mo, d) = m.destructured
        // LocalDate.of rejects the likes of 2026-02-31 rather than rolling over.
        val date = try {
            LocalDate.of(y.toInt(), mo.toInt(), d.toInt())
        } catch (_: DateTimeException) {
            return UNKNOWN_DAY
        }
        val day = ChronoUnit.DAYS.between(EPOCH, date)
        return day.coerceIn(1, MAX_DAY.toLong()).toInt()
    }

    private fun isoFromDay(day: Int, today: () -> String): String =
        if (day == UNKNOWN_DAY) today() else EPOCH.plusDays(day.toLong()).toString()

    /** Packs the visited map into a shareable code, grouped for readability. */
    fun encode(visited: VisitedMap): String {
        val width = BITMAP_WIDTH.getValue(VERSION)
        val bits = mutableListOf<Int>()
        bits.pushBits(VERSION, VERSION_BITS)

        val days = mutableListOf<Int>()
        for (i in 0 until width) {
            val iso = visited[CODE_ORDER[i]]
            bits.add(if (iso != null) 1 else 0)
            if (iso != null) days.add(dayFromIso(iso))
        }
        for (day in days) bits.pushBits(day, DATE_BITS)

        while (bits.size % 5 != 0) bits.add(0)

        val values = mutableListOf<Int>()
        for (i in bits.indices step 5) values.add(bits.readBits(i, 5))

        val checksum = crc16(values) and ((1 shl CHECKSUM_BITS) - 1)
        values.add((checksum shr 5) and 31)
        values.add(checksum and 31)

        val body = values.joinToString("") { ALPHABET[it].toString() }
        return "$PREFIX-" + body.chunked(4).joinToString("-")
    }

    /**
     * Parses a pasted code. Tolerates lowercase, missing prefix, and any
     * spacing or punctuation the clipboard picked up on the way.
     *
     * @param knownSlugs parks in the current dataset; others are dropped so a
     *   removed park can't resurrect itself in storage.
     * @param today the local date used for the reserved "unknown date" day.
     */
    fun decode(
        raw: String,
        knownSlugs: Set<String> = CODE_ORDER.toSet(),
        today: () -> String = { LocalDate.now().toString() },
    ): DecodeResult {
        val cleaned = raw.uppercase().filter { it in '0'..'9' || it in 'A'..'Z' }
        val body = cleaned.removePrefix(PREFIX)

        if (body.isEmpty()) {
            if (raw.isBlank()) return DecodeResult.Error(DecodeError.EMPTY)
            // "PARKPASS-" on its own is a truncated code; anything else is not one.
            return DecodeResult.Error(
                if (cleaned.isNotEmpty()) DecodeError.LENGTH else DecodeError.CHARSET,
            )
        }

        val values = body.map { CHAR_VALUES[it] ?: return DecodeResult.Error(DecodeError.CHARSET) }
        if (values.size <= CHECKSUM_CHARS) return DecodeResult.Error(DecodeError.LENGTH)

        val data = values.dropLast(CHECKSUM_CHARS)
        val (hi, lo) = values.takeLast(CHECKSUM_CHARS)
        val expected = crc16(data) and ((1 shl CHECKSUM_BITS) - 1)
        if (((hi shl 5) or lo) != expected) return DecodeResult.Error(DecodeError.CHECKSUM)

        val bits = mutableListOf<Int>()
        for (value in data) bits.pushBits(value, 5)

        if (bits.size < VERSION_BITS) return DecodeResult.Error(DecodeError.LENGTH)
        val version = bits.readBits(0, VERSION_BITS)
        val width = BITMAP_WIDTH[version] ?: return DecodeResult.Error(DecodeError.VERSION)
        if (bits.size < VERSION_BITS + width) return DecodeResult.Error(DecodeError.LENGTH)

        val pinned = (0 until width).filter { bits[VERSION_BITS + it] == 1 }.map { CODE_ORDER[it] }

        var offset = VERSION_BITS + width
        if (bits.size < offset + pinned.size * DATE_BITS) {
            return DecodeResult.Error(DecodeError.LENGTH)
        }

        val visits = LinkedHashMap<String, String>()
        for (slug in pinned) {
            val day = bits.readBits(offset, DATE_BITS)
            offset += DATE_BITS
            if (slug in knownSlugs) visits[slug] = isoFromDay(day, today)
        }
        return DecodeResult.Ok(visits)
    }
}
