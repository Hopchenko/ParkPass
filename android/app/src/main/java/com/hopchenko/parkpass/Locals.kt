package com.hopchenko.parkpass

import androidx.compose.runtime.staticCompositionLocalOf
import com.hopchenko.parkpass.data.ParkRepository

/** The park dataset and artwork cache, provided once at the root of the UI. */
val LocalParkRepository = staticCompositionLocalOf<ParkRepository> {
    error("LocalParkRepository not provided")
}
