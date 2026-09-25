package com.hopchenko.parkpass.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DataTest {
    private fun resource(name: String) = javaClass.classLoader.getResource(name)!!.readText()

    @Test
    fun parsesAll31Parks() {
        val parks = ParkData.parse(resource("parks.json"))
        assertEquals(31, parks.size)
        assertEquals(parks.size, parks.map { it.slug }.toSet().size)
        val muddus = parks.first { it.slug == "muddus" }
        assertEquals("Muttos", muddus.sami)
        assertTrue(muddus.officialUrl.sv.startsWith("https://www.sverigesnationalparker.se/sv/"))
    }

    @Test
    fun everyParkIsOnTheMap() {
        val parks = ParkData.parse(resource("parks.json")).map { it.slug }.toSet()
        val map = MapData.parse(resource("map.json"))
        assertEquals(parks, map.parks.map { it.slug }.toSet())
        assertTrue(map.land.all { it.size == 2 })
    }
}
