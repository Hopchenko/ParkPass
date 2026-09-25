package com.hopchenko.parkpass.ui.theme

import androidx.compose.foundation.text.selection.LocalTextSelectionColors
import androidx.compose.foundation.text.selection.TextSelectionColors
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider

private val Scheme = lightColorScheme(
    primary = ParkPassColors.Accent,
    onPrimary = ParkPassColors.Ground,
    secondary = ParkPassColors.Sage,
    background = ParkPassColors.Ground,
    onBackground = ParkPassColors.Ink,
    surface = ParkPassColors.Ground,
    onSurface = ParkPassColors.Ink,
    surfaceVariant = ParkPassColors.Surface,
    outline = ParkPassColors.Divider,
)

/** Light only, by design — see docs/specs/design-system.md. */
@Composable
fun ParkPassTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = Scheme, typography = ParkPassTypography) {
        CompositionLocalProvider(
            LocalTextSelectionColors provides TextSelectionColors(
                handleColor = ParkPassColors.Accent,
                backgroundColor = ParkPassColors.Accent.copy(alpha = 0.3f),
            ),
            content = content,
        )
    }
}
