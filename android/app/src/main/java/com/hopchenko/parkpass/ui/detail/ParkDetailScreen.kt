package com.hopchenko.parkpass.ui.detail

import android.os.Build
import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.core.Park
import com.hopchenko.parkpass.data.currentLang
import com.hopchenko.parkpass.data.formatArea
import com.hopchenko.parkpass.data.formatVisitDate
import com.hopchenko.parkpass.ui.components.ParkIcons
import com.hopchenko.parkpass.ui.components.Pill
import com.hopchenko.parkpass.ui.components.PinBadge
import com.hopchenko.parkpass.ui.components.PinLook
import com.hopchenko.parkpass.ui.components.openInBrowser
import com.hopchenko.parkpass.ui.theme.Caprasimo
import com.hopchenko.parkpass.ui.theme.Figtree
import com.hopchenko.parkpass.ui.theme.ParkPassColors
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// The web app's @keyframes (globals.css), number for number.
private val StampInEasing = CubicBezierEasing(0.2f, 1.4f, 0.4f, 1f)
private val PinScale = Keyframes(StampInEasing, 0f to 2.4f, 0.55f to 0.9f, 0.75f to 1.06f, 1f to 1f)
private val PinRotation = Keyframes(StampInEasing, 0f to -16f, 0.55f to 3f, 0.75f to -1f, 1f to 0f)
private val PinAlpha = Keyframes(StampInEasing, 0f to 0f, 0.55f to 1f, 1f to 1f)

private val PressEasing = CubicBezierEasing(0.6f, 0.04f, 0.98f, 0.335f)
private val PressScale = Keyframes(PressEasing, 0f to 1.9f, 1f to 1f)
private val PressRotation = Keyframes(PressEasing, 0f to -2f, 1f to -15f)
private val PressAlpha = Keyframes(PressEasing, 0f to 0f, 0.55f to 0.9f, 1f to 0.85f)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ParkDetailScreen(
    park: Park,
    visitDate: String?,
    backLabel: String,
    onBack: () -> Unit,
    onMark: () -> Unit,
    onUnmark: () -> Unit,
) {
    val lang = currentLang()
    val context = LocalContext.current
    val view = LocalView.current
    val scope = rememberCoroutineScope()

    // 1 = settled. Pinning snaps these to 0 and plays them out.
    val pin = remember { Animatable(1f) }
    val press = remember { Animatable(1f) }
    val confetti = remember { Animatable(0f) }
    var confettiOn by remember { mutableStateOf(false) }
    var stampRun by remember { mutableIntStateOf(0) }

    LaunchedEffect(stampRun) {
        if (stampRun == 0) return@LaunchedEffect
        pin.snapTo(0f)
        press.snapTo(0f)
        confetti.snapTo(0f)
        confettiOn = true
        coroutineScope {
            launch { pin.animateTo(1f, tween(550, easing = LinearEasing)) }
            launch {
                // Delayed so the pin finishes stamping in before the mark lands.
                delay(250)
                press.animateTo(1f, tween(450, easing = LinearEasing))
            }
            launch {
                confetti.animateTo(CONFETTI_SECONDS, tween((CONFETTI_SECONDS * 1000).toInt(), easing = LinearEasing))
            }
            launch {
                // The pin lands at the 55% keyframe.
                delay(300)
                val feedback = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    HapticFeedbackConstants.CONFIRM
                } else {
                    HapticFeedbackConstants.LONG_PRESS
                }
                view.performHapticFeedback(feedback)
            }
        }
        confettiOn = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        BackLink(backLabel, onBack)

        Column(
            modifier = Modifier.padding(start = 24.dp, end = 24.dp, bottom = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp, bottom = 4.dp),
                contentAlignment = Alignment.Center,
            ) {
                val t = pin.value
                PinBadge(
                    park = park,
                    look = if (visitDate != null) PinLook.Full else PinLook.DetailUnpinned,
                    strokeWidth = 2.4f,
                    modifier = Modifier
                        .size(210.dp)
                        .graphicsLayer {
                            scaleX = PinScale.at(t)
                            scaleY = PinScale.at(t)
                            rotationZ = PinRotation.at(t)
                            alpha = PinAlpha.at(t)
                        },
                )
                if (confettiOn) Confetti(confetti.value, Modifier.matchParentSize())
            }

            Text(
                park.name,
                modifier = Modifier.padding(top = 12.dp, bottom = 2.dp),
                style = TextStyle(fontFamily = Caprasimo, fontSize = 29.sp, lineHeight = 33.sp, color = ParkPassColors.Ink, textAlign = TextAlign.Center),
            )
            park.sami?.let {
                Text(it, style = TextStyle(fontFamily = Figtree, fontSize = 14.sp, fontStyle = FontStyle.Italic, color = ParkPassColors.Neutral600))
            }

            FlowRow(
                modifier = Modifier.padding(top = 16.dp, bottom = 18.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Pill(park.region[lang], ParkPassColors.Sage100, ParkPassColors.Sage800)
                Pill(stringResource(R.string.detail_est, park.year.toString()), ParkPassColors.Neutral100, ParkPassColors.Neutral800)
                Pill(stringResource(R.string.detail_area, formatArea(park.area, lang)), ParkPassColors.Neutral100, ParkPassColors.Neutral800)
            }

            Text(
                park.description[lang],
                modifier = Modifier.padding(bottom = 22.dp),
                style = TextStyle(fontFamily = Figtree, fontSize = 15.sp, lineHeight = (15 * 1.55).sp, color = ParkPassColors.Neutral800, textAlign = TextAlign.Center),
            )

            // One fixed-height slot for both states, so toggling never moves the page.
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp),
            ) {
                if (visitDate != null) {
                    PinnedCard(formatVisitDate(visitDate, lang)) {
                        scope.launch {
                            confettiOn = false
                            pin.snapTo(1f)
                            press.snapTo(1f)
                        }
                        onUnmark()
                    }
                } else {
                    Surface(
                        onClick = {
                            onMark()
                            stampRun++
                        },
                        shape = RoundedCornerShape(50),
                        color = ParkPassColors.Accent,
                        modifier = Modifier.fillMaxSize(),
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                stringResource(R.string.detail_pinIt),
                                modifier = Modifier.padding(horizontal = 16.dp),
                                style = TextStyle(fontFamily = Caprasimo, fontSize = 16.sp, color = ParkPassColors.Ground, textAlign = TextAlign.Center),
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(12.dp))

            Surface(
                onClick = { context.openInBrowser(park.officialUrl[lang]) },
                shape = RoundedCornerShape(50),
                color = ParkPassColors.Transparent,
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 48.dp),
            ) {
                Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 4.dp, vertical = 12.dp)) {
                    Text(
                        stringResource(R.string.detail_official),
                        style = TextStyle(fontFamily = Caprasimo, fontSize = 14.sp, color = ParkPassColors.Accent, textAlign = TextAlign.Center),
                    )
                }
            }

            // Height is reserved whether or not the park is stamped.
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(172.dp)
                    .padding(end = 4.dp),
                contentAlignment = Alignment.CenterEnd,
            ) {
                if (visitDate != null) {
                    val p = press.value
                    VisitStamp(
                        iso = visitDate,
                        lang = lang,
                        modifier = Modifier
                            .size(164.dp)
                            .graphicsLayer {
                                scaleX = PressScale.at(p)
                                scaleY = PressScale.at(p)
                                rotationZ = PressRotation.at(p)
                                alpha = PressAlpha.at(p)
                            },
                    )
                }
            }

            Text(
                stringResource(R.string.detail_disclaimer),
                modifier = Modifier.padding(top = 32.dp),
                style = TextStyle(fontFamily = Figtree, fontSize = 11.5.sp, color = ParkPassColors.Neutral500, textAlign = TextAlign.Center),
            )
        }
    }
}

@Composable
private fun BackLink(label: String, onBack: () -> Unit) {
    Surface(
        onClick = onBack,
        color = ParkPassColors.Transparent,
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.padding(start = 10.dp, top = 6.dp),
    ) {
        Row(
            modifier = Modifier
                .heightIn(min = 44.dp)
                .padding(horizontal = 8.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(ParkIcons.Back, contentDescription = null, tint = ParkPassColors.Accent700, modifier = Modifier.size(20.dp))
            Spacer(Modifier.width(2.dp))
            Text(label, style = TextStyle(fontFamily = Figtree, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = ParkPassColors.Accent700))
        }
    }
}

@Composable
private fun PinnedCard(date: String, onUndo: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxSize()
            .background(ParkPassColors.Sage200, RoundedCornerShape(16.dp))
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(ParkIcons.CheckBold, contentDescription = null, tint = ParkPassColors.Sage700, modifier = Modifier.size(22.dp))
        Spacer(Modifier.width(10.dp))
        Text(
            stringResource(R.string.detail_pinned, date),
            style = TextStyle(fontFamily = Figtree, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = ParkPassColors.Sage800),
        )
        Spacer(Modifier.width(10.dp))
        Surface(onClick = onUndo, color = ParkPassColors.Transparent, shape = RoundedCornerShape(8.dp)) {
            Box(
                modifier = Modifier
                    .heightIn(min = 44.dp)
                    .padding(8.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    stringResource(R.string.detail_undo),
                    style = TextStyle(
                        fontFamily = Figtree,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = ParkPassColors.Sage700,
                        textDecoration = TextDecoration.Underline,
                    ),
                )
            }
        }
    }
}
