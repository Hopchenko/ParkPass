package com.hopchenko.parkpass.ui.components

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hopchenko.parkpass.ui.theme.Figtree
import com.hopchenko.parkpass.ui.theme.ParkPassColors
import com.hopchenko.parkpass.ui.theme.TitleStyle

/** A small rounded tag: count chips, region/year/area tags. */
@Composable
fun Pill(text: String, background: Color, color: Color, modifier: Modifier = Modifier) {
    Text(
        text = text,
        modifier = modifier
            .background(background, RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 3.dp),
        style = TextStyle(fontFamily = Figtree, fontSize = 11.sp, letterSpacing = 0.22.sp, color = color),
    )
}

@Composable
fun CountChip(text: String) = Pill(text, ParkPassColors.Accent100, ParkPassColors.Accent800)

/** Title on the left, count chip on the right — map, board. */
@Composable
fun ScreenHeader(title: String, count: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 18.dp, end = 18.dp, top = 16.dp, bottom = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(title, style = TitleStyle)
        CountChip(count)
    }
}

/** Opens a link in the browser; the app itself never touches the network. */
fun Context.openInBrowser(url: String) {
    try {
        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: ActivityNotFoundException) {
        // No browser installed — nothing sensible to do.
    }
}
