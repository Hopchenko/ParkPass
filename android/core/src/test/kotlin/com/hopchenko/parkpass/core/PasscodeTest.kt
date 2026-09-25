package com.hopchenko.parkpass.core

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Replays shared/passcode-vectors.json, which the web app's own codec wrote
 * (npm run export:shared). If these pass, a code made on the phone imports in
 * the browser and vice versa.
 */
class PasscodeTest {
    private val vectors: JsonObject = run {
        val text = javaClass.classLoader.getResource("passcode-vectors.json")!!.readText()
        Json.parseToJsonElement(text).jsonObject
    }

    private val parks: List<Park> = ParkData.parse(
        javaClass.classLoader.getResource("parks.json")!!.readText(),
    )

    private fun JsonObject.toVisits(): VisitedMap = mapValues { it.value.jsonPrimitive.content }

    @Test
    fun codeOrderMatchesWeb() {
        val web = vectors.getValue("codeOrder").jsonArray.map { it.jsonPrimitive.content }
        assertEquals(web, Passcode.CODE_ORDER)
    }

    @Test
    fun everyParkHasACodeSlot() {
        val missing = parks.map { it.slug } - Passcode.CODE_ORDER.toSet()
        assertTrue("parks missing from CODE_ORDER: $missing", missing.isEmpty())
    }

    @Test
    fun encodesExactlyLikeWeb() {
        for (vector in vectors.getValue("encode").jsonArray) {
            val v = vector.jsonObject
            val name = v.getValue("name").jsonPrimitive.content
            val visits = v.getValue("visits").jsonObject.toVisits()
            assertEquals(name, v.getValue("code").jsonPrimitive.content, Passcode.encode(visits))
        }
    }

    @Test
    fun decodesExactlyLikeWeb() {
        for (vector in vectors.getValue("encode").jsonArray) {
            val v = vector.jsonObject
            val name = v.getValue("name").jsonPrimitive.content
            val expected = v.getValue("decoded").jsonObject.toVisits()
            val result = Passcode.decode(v.getValue("code").jsonPrimitive.content)
            assertEquals(name, Passcode.DecodeResult.Ok(expected), result)
        }
    }

    @Test
    fun handlesMessyAndBrokenInputLikeWeb() {
        for (vector in vectors.getValue("decode").jsonArray) {
            val v = vector.jsonObject
            val name = v.getValue("name").jsonPrimitive.content
            val input = v.getValue("input").jsonPrimitive.content
            val expected = v.getValue("result").jsonObject
            val actual = Passcode.decode(input)
            if (expected.getValue("ok").jsonPrimitive.boolean) {
                val visits = expected.getValue("visits").jsonObject.toVisits()
                assertEquals(name, Passcode.DecodeResult.Ok(visits), actual)
            } else {
                val error = expected.getValue("error").jsonPrimitive.content
                assertEquals(
                    name,
                    Passcode.DecodeResult.Error(Passcode.DecodeError.valueOf(error.uppercase())),
                    actual,
                )
            }
        }
    }

    @Test
    fun unknownDateBecomesToday() {
        val code = Passcode.encode(mapOf("sarek" to "not-a-date"))
        val result = Passcode.decode(code, today = { "2026-09-25" })
        assertEquals(Passcode.DecodeResult.Ok(mapOf("sarek" to "2026-09-25")), result)
    }

    @Test
    fun impossibleCalendarDateIsUnknown() {
        val code = Passcode.encode(mapOf("sarek" to "2026-02-31"))
        val result = Passcode.decode(code, today = { "2026-09-25" })
        assertEquals(Passcode.DecodeResult.Ok(mapOf("sarek" to "2026-09-25")), result)
    }

    @Test
    fun dropsParksNotInTheDataset() {
        val code = Passcode.encode(mapOf("sarek" to "2024-01-01", "abisko" to "2024-01-02"))
        val result = Passcode.decode(code, knownSlugs = setOf("abisko"))
        assertEquals(Passcode.DecodeResult.Ok(mapOf("abisko" to "2024-01-02")), result)
    }
}
