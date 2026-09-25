package com.hopchenko.parkpass

import android.app.Application
import com.hopchenko.parkpass.data.ParkRepository
import com.hopchenko.parkpass.data.VisitStore

/** Holds the app's two singletons — small enough that DI would be overkill. */
class ParkPassApplication : Application() {
    val parks: ParkRepository by lazy { ParkRepository(this) }
    val visits: VisitStore by lazy { VisitStore(this) }
}
