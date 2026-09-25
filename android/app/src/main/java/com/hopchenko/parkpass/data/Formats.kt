package com.hopchenko.parkpass.data

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.res.stringResource
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.core.Lang
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * The language whose string catalogue actually resolved. Read from a resource
 * rather than the device locale so park text and UI text can never disagree
 * (e.g. a German phone falls back to the Swedish catalogue, and gets Swedish
 * park descriptions to match).
 */
@Composable
@ReadOnlyComposable
fun currentLang(): Lang = if (stringResource(R.string.lang_tag) == "en") Lang.EN else Lang.SV

private fun Lang.locale(): Locale = when (this) {
    Lang.SV -> Locale.forLanguageTag("sv-SE")
    Lang.EN -> Locale.forLanguageTag("en-GB")
}

private fun parse(iso: String): LocalDate? = try {
    LocalDate.parse(iso)
} catch (_: Exception) {
    null
}

/** "24 jul. 2026" / "24 Jul 2026" — a calendar date, no time-zone maths. */
fun formatVisitDate(iso: String, lang: Lang): String =
    parse(iso)?.format(DateTimeFormatter.ofPattern("d MMM yyyy", lang.locale())) ?: iso

/** "24 JUL 2026" — short, uppercase, no periods, for the rubber stamp. */
fun formatStampDate(iso: String, lang: Lang): String =
    parse(iso)?.format(DateTimeFormatter.ofPattern("dd MMM yyyy", lang.locale()))
        ?.replace(".", "")
        ?.uppercase(lang.locale())
        ?: iso

/** "1 278" / "1,278"; fractional areas keep one decimal ("1,1" / "1.1"). */
fun formatArea(area: Double, lang: Lang): String =
    NumberFormat.getNumberInstance(lang.locale()).apply { maximumFractionDigits = 1 }.format(area)
