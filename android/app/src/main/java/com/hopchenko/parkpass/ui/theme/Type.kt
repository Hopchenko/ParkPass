package com.hopchenko.parkpass.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.hopchenko.parkpass.R

/** Chunky display face for headings and buttons. */
val Caprasimo = FontFamily(Font(R.font.caprasimo, FontWeight.Normal))

/** Figtree is a variable font; each weight is an instance of the one file. */
@OptIn(ExperimentalTextApi::class)
val Figtree = FontFamily(
    listOf(300, 400, 500, 600, 700, 800, 900).map { weight ->
        Font(
            R.font.figtree,
            FontWeight(weight),
            variationSettings = FontVariation.Settings(FontVariation.weight(weight)),
        )
    },
)

private val Body = TextStyle(
    fontFamily = Figtree,
    fontSize = 15.sp,
    lineHeight = (15 * 1.55).sp,
    color = ParkPassColors.Ink,
)

val ParkPassTypography = Typography(
    bodyLarge = Body,
    bodyMedium = Body,
    bodySmall = Body.copy(fontSize = 13.sp, lineHeight = 18.sp),
    labelLarge = Body.copy(fontWeight = FontWeight.Bold),
    titleLarge = TextStyle(fontFamily = Caprasimo, fontSize = 27.sp, lineHeight = 32.sp, color = ParkPassColors.Ink),
)

/** Screen titles: Caprasimo 27. */
val TitleStyle = TextStyle(fontFamily = Caprasimo, fontSize = 27.sp, lineHeight = 32.sp, color = ParkPassColors.Ink)
