package com.hopchenko.parkpass.ui.map

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.core.MapData
import com.hopchenko.parkpass.core.VisitedMap
import com.hopchenko.parkpass.data.ParkRepository
import com.hopchenko.parkpass.ui.components.ScreenHeader
import com.hopchenko.parkpass.ui.theme.Figtree
import com.hopchenko.parkpass.ui.theme.ParkPassColors
import kotlin.math.hypot

/** One hexagon in viewBox units, from its anchor vertex — docs/specs/data.md. */
private fun hexPath(x: Double, y: Double, scale: Float): Path = Path().apply {
    MapData.HEX_CORNERS.forEachIndexed { i, (dx, dy) ->
        val px = ((x + dx) * scale).toFloat()
        val py = ((y + dy) * scale).toFloat()
        if (i == 0) moveTo(px, py) else lineTo(px, py)
    }
    close()
}

@Composable
fun MapScreen(repository: ParkRepository, visited: VisitedMap, onOpen: (String) -> Unit) {
    val map = repository.map
    val count = repository.parks.count { it.slug in visited }
    // Only parks that exist in the dataset are drawn or tappable.
    val parkHexes = remember(map) { map.parks.filter { repository.park(it.slug) != null } }
    val mapLabel = stringResource(R.string.map_mapLabel)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        ScreenHeader(stringResource(R.string.map_title), stringResource(R.string.map_count, count))

        Box(Modifier.padding(start = 32.dp, end = 32.dp, bottom = 16.dp)) {
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio((map.viewBox.width / map.viewBox.height).toFloat())
                    .semantics { contentDescription = mapLabel }
                    .pointerInput(parkHexes) {
                        detectTapGestures { tap ->
                            val scale = size.width / map.viewBox.width
                            // Nearest park centre within one circumradius — hexes are small.
                            val hit = parkHexes
                                .map { hex ->
                                    val cx = (hex.x + MapData.CENTER_DX) * scale
                                    val cy = (hex.y + MapData.CENTER_DY) * scale
                                    hex to hypot(tap.x - cx, tap.y - cy)
                                }
                                .filter { (_, d) -> d <= MapData.CIRCUMRADIUS * scale }
                                .minByOrNull { (_, d) -> d }
                            hit?.let { onOpen(it.first.slug) }
                        }
                    },
            ) {
                val scale = (size.width / map.viewBox.width).toFloat()
                for (point in map.land) {
                    drawPath(hexPath(point[0], point[1], scale), ParkPassColors.Neutral300)
                }
                for (hex in parkHexes) {
                    val color = if (hex.slug in visited) ParkPassColors.Accent else ParkPassColors.Sage400
                    drawPath(hexPath(hex.x, hex.y, scale), color)
                }
            }

            // Sits over the empty north-west of the map.
            Column(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .offset(x = (-12).dp)
                    .background(ParkPassColors.Ground.copy(alpha = 0.8f), RoundedCornerShape(16.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                LegendRow(ParkPassColors.Accent, stringResource(R.string.map_legendVisited))
                LegendRow(ParkPassColors.Sage400, stringResource(R.string.map_legendTodo))
            }
        }
    }
}

@Composable
private fun LegendRow(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier
                .size(12.dp)
                .background(color, CircleShape),
        )
        Spacer(Modifier.width(6.dp))
        Text(label, style = TextStyle(fontFamily = Figtree, fontSize = 12.5.sp, color = ParkPassColors.Neutral700))
    }
}
