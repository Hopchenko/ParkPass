package com.hopchenko.parkpass.ui.board

import android.graphics.BitmapShader
import android.graphics.Matrix
import android.graphics.Shader
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.graphics.TileMode
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hopchenko.parkpass.LocalParkRepository
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.core.Park
import com.hopchenko.parkpass.core.VisitedMap
import com.hopchenko.parkpass.data.ParkRepository
import com.hopchenko.parkpass.data.rememberAssetImage
import com.hopchenko.parkpass.ui.components.PinBadge
import com.hopchenko.parkpass.ui.components.PinLook
import com.hopchenko.parkpass.ui.components.ScreenHeader
import com.hopchenko.parkpass.ui.theme.Figtree
import com.hopchenko.parkpass.ui.theme.ParkPassColors
import kotlin.math.cos
import kotlin.math.sin

private val FabricFallback = Color(0xFF3A4A28)
private val PinnedName = Color(0xFFF5EAD8)
private val GhostName = Color(0x73F5EAD8) // rgba(245,234,216,.45)

/** CSS repeating-linear-gradient(92deg, …) over a 30px period. */
private val WoodStops = arrayOf(
    0f to Color(0xFF8C5A2E),
    7f / 30f to Color(0xFF7A4C24),
    14f / 30f to Color(0xFF96632F),
    22f / 30f to Color(0xFF82522A),
    1f to Color(0xFF8F5D2D),
)

@Composable
fun PinBoardScreen(parks: List<Park>, visited: VisitedMap, onOpen: (String) -> Unit) {
    val count = parks.count { it.slug in visited }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        ScreenHeader(stringResource(R.string.board_title), stringResource(R.string.board_count, count))

        Box(Modifier.padding(start = 14.dp, end = 14.dp, top = 4.dp, bottom = 20.dp)) {
            WoodFrame {
                Fabric {
                    Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                        parks.chunked(3).forEach { row ->
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                row.forEach { park ->
                                    BoardPin(park, park.slug in visited, Modifier.weight(1f)) { onOpen(park.slug) }
                                }
                                repeat(3 - row.size) { Box(Modifier.weight(1f)) }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun WoodFrame(content: @Composable () -> Unit) {
    val shape = RoundedCornerShape(26.dp)
    val period = with(LocalDensity.current) { 30.dp.toPx() }
    // CSS 92deg points right and a touch down.
    val angle = Math.toRadians(92.0)
    val direction = Offset(sin(angle).toFloat(), -cos(angle).toFloat())

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(6.dp, shape, ambientColor = ParkPassColors.Neutral900, spotColor = ParkPassColors.Neutral900)
            .clip(shape)
            .background(Brush.linearGradient(*WoodStops, start = Offset.Zero, end = direction * period, tileMode = TileMode.Repeated))
            .background(Brush.linearGradient(0f to Color.White.copy(alpha = 0.14f), 1f to Color.Black.copy(alpha = 0.16f)))
            .drawWithContent {
                drawContent()
                // Bevel: light along the top edge, shade along the bottom.
                val edge = 3.dp.toPx()
                drawRect(
                    Brush.verticalGradient(listOf(Color.White.copy(alpha = 0.3f), Color.Transparent), endY = edge),
                )
                drawRect(
                    Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.3f)), startY = size.height - 2 * edge, endY = size.height),
                )
            }
            .padding(10.dp),
    ) {
        content()
    }
}

@Composable
private fun Fabric(repository: ParkRepository = LocalParkRepository.current, content: @Composable () -> Unit) {
    val fabric = rememberAssetImage(repository, ParkRepository.FABRIC_PATH).value
    val tile = with(LocalDensity.current) { 280.dp.toPx() }
    val shape = RoundedCornerShape(16.dp)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(FabricFallback)
            .drawBehind {
                if (fabric != null) {
                    val bitmap = fabric.asAndroidBitmap()
                    val shader = BitmapShader(bitmap, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT).apply {
                        // Tiled at 280pt per tile, centred like `center / 280px repeat`.
                        val s = tile / bitmap.width
                        setLocalMatrix(
                            Matrix().apply {
                                setScale(s, s)
                                postTranslate(size.width / 2f - tile / 2f, size.height / 2f - bitmap.height * s / 2f)
                            },
                        )
                    }
                    drawRect(ShaderBrush(shader))
                }
            }
            .drawWithContent {
                drawContent()
                // Inset shadow: inset 0 3px 12px rgba(0,0,0,.5).
                drawRect(
                    Brush.verticalGradient(listOf(Color.Black.copy(alpha = 0.45f), Color.Transparent), endY = 14.dp.toPx()),
                )
                drawRect(
                    Brush.horizontalGradient(listOf(Color.Black.copy(alpha = 0.25f), Color.Transparent), endX = 10.dp.toPx()),
                )
                drawRect(
                    Brush.horizontalGradient(
                        listOf(Color.Transparent, Color.Black.copy(alpha = 0.25f)),
                        startX = size.width - 10.dp.toPx(),
                        endX = size.width,
                    ),
                )
            }
            .padding(start = 8.dp, end = 8.dp, top = 20.dp, bottom = 22.dp),
    ) {
        content()
    }
}

@Composable
private fun BoardPin(park: Park, pinned: Boolean, modifier: Modifier, onClick: () -> Unit) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(7.dp),
    ) {
        // Fluid: fills the column, so pins grow with the screen.
        PinBadge(
            park = park,
            look = if (pinned) PinLook.BoardPinned else PinLook.BoardUnpinned,
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f),
        )
        Text(
            park.name,
            style = TextStyle(
                fontFamily = Figtree,
                fontSize = 10.5.sp,
                lineHeight = (10.5 * 1.25).sp,
                fontWeight = FontWeight.Bold,
                color = if (pinned) PinnedName else GhostName,
                textAlign = TextAlign.Center,
                shadow = Shadow(Color.Black.copy(alpha = 0.4f), Offset(0f, 2f), blurRadius = 4f),
            ),
        )
    }
}
