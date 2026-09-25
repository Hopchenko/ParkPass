package com.hopchenko.parkpass

import android.os.Bundle
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.ui.graphics.toArgb
import com.hopchenko.parkpass.ui.ParkPassApp
import com.hopchenko.parkpass.ui.theme.ParkPassColors
import com.hopchenko.parkpass.ui.theme.ParkPassTheme

// AppCompatActivity rather than ComponentActivity: it is what applies the
// in-app language choice (AppCompatDelegate.setApplicationLocales) on
// Android 12 and older.
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Light theme only — the pins and fabric are designed for the paper ground.
        val bars = SystemBarStyle.light(
            ParkPassColors.Transparent.toArgb(),
            ParkPassColors.Transparent.toArgb(),
        )
        enableEdgeToEdge(statusBarStyle = bars, navigationBarStyle = bars)
        super.onCreate(savedInstanceState)

        val app = application as ParkPassApplication
        setContent {
            ParkPassTheme {
                ParkPassApp(parks = app.parks, visits = app.visits)
            }
        }
    }
}
