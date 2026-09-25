package com.hopchenko.parkpass.ui.profile

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.os.LocaleListCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.hopchenko.parkpass.BuildConfig
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.core.Lang
import com.hopchenko.parkpass.core.Passcode
import com.hopchenko.parkpass.data.VisitStore
import com.hopchenko.parkpass.data.currentLang
import com.hopchenko.parkpass.ui.components.openInBrowser
import com.hopchenko.parkpass.ui.theme.Caprasimo
import com.hopchenko.parkpass.ui.theme.Figtree
import com.hopchenko.parkpass.ui.theme.ParkPassColors
import com.hopchenko.parkpass.ui.theme.TitleStyle
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

private const val OFFICIAL_CHECKLIST_URL =
    "https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista"

private val CardShape = RoundedCornerShape(32.dp)
private val Mono = FontFamily.Monospace

/** Result line under the import field. */
private data class Status(val ok: Boolean, val text: String)

@Composable
fun ProfileScreen(parkCount: Int, knownSlugs: Set<String>, visits: VisitStore) {
    val visited by visits.visits.collectAsStateWithLifecycle()
    val count = visited.keys.count { it in knownSlugs }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.you_title), style = TitleStyle)
        ProgressCard(count, parkCount)
        DiplomaCard()
        TransferCard(
            // No pins means no code worth showing — an empty one transfers nothing.
            code = if (count > 0) Passcode.encode(visited) else null,
            onImport = { raw -> importCode(raw, knownSlugs, visits) },
        )
        LanguageSwitch()
        Footer()
    }
}

@Composable
private fun ProgressCard(count: Int, total: Int) {
    val fraction by animateFloatAsState(
        targetValue = (count * 100f / total).roundToInt() / 100f,
        animationSpec = tween(500, easing = FastOutSlowInEasing),
        label = "progress",
    )
    Card(ParkPassColors.Surface, padding = 20.dp, spacing = 12.dp) {
        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                count.toString(),
                style = TextStyle(fontFamily = Caprasimo, fontSize = 44.sp, lineHeight = 48.sp, color = ParkPassColors.Accent700),
                modifier = Modifier.alignByBaseline(),
            )
            Spacer(Modifier.width(8.dp))
            Text(
                stringResource(R.string.you_of31),
                style = TextStyle(fontFamily = Figtree, fontSize = 17.sp, fontWeight = FontWeight.Bold, color = ParkPassColors.Neutral600),
                modifier = Modifier.alignByBaseline(),
            )
        }
        Box(
            Modifier
                .fillMaxWidth()
                .height(14.dp)
                .background(ParkPassColors.Neutral300, RoundedCornerShape(50)),
        ) {
            Box(
                Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(fraction)
                    .background(ParkPassColors.Accent, RoundedCornerShape(50)),
            )
        }
        Text(
            if (count >= total) {
                stringResource(R.string.you_done)
            } else {
                pluralStringResource(R.plurals.you_toGo, total - count, total - count)
            },
            style = TextStyle(fontFamily = Figtree, fontSize = 13.5.sp, color = ParkPassColors.Neutral700),
        )
    }
}

@Composable
private fun DiplomaCard() {
    val context = LocalContext.current
    Card(ParkPassColors.Sage200, padding = 18.dp, spacing = 8.dp) {
        Text(
            stringResource(R.string.you_diplomaTitle),
            style = TextStyle(fontFamily = Figtree, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = ParkPassColors.Sage900),
        )
        Text(
            stringResource(R.string.you_diplomaBody),
            style = TextStyle(fontFamily = Figtree, fontSize = 13.5.sp, lineHeight = (13.5 * 1.5).sp, color = ParkPassColors.Sage800),
        )
        Text(
            stringResource(R.string.you_diplomaLink),
            modifier = Modifier.clickable { context.openInBrowser(OFFICIAL_CHECKLIST_URL) },
            style = TextStyle(fontFamily = Figtree, fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = ParkPassColors.Sage700),
        )
    }
}

@Composable
private fun TransferCard(code: String?, onImport: (String) -> ImportOutcome) {
    val context = LocalContext.current
    var draft by rememberSaveable { mutableStateOf("") }
    var status by remember { mutableStateOf<Status?>(null) }
    var copied by remember { mutableStateOf(false) }

    val copyFailed = stringResource(R.string.you_copyFailed)
    val shareTitle = stringResource(R.string.you_shareTitle)
    val messages = importMessages()

    LaunchedEffect(copied) {
        if (copied) {
            delay(2000)
            copied = false
        }
    }

    Card(ParkPassColors.Surface, padding = 18.dp, spacing = 10.dp) {
        Text(
            stringResource(R.string.you_transferTitle),
            style = TextStyle(fontFamily = Figtree, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = ParkPassColors.Ink),
        )
        Text(
            stringResource(R.string.you_transferBody),
            style = TextStyle(fontFamily = Figtree, fontSize = 13.5.sp, lineHeight = (13.5 * 1.5).sp, color = ParkPassColors.Neutral700),
        )

        if (code != null) {
            Label(stringResource(R.string.you_yourCode))
            SelectionContainer {
                Text(
                    code,
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(ParkPassColors.Neutral100, RoundedCornerShape(16.dp))
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    style = TextStyle(fontFamily = Mono, fontSize = 12.5.sp, lineHeight = 20.sp, color = ParkPassColors.Neutral800),
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedPill(
                    if (copied) stringResource(R.string.you_copied) else stringResource(R.string.you_copy),
                    Modifier.weight(1f),
                ) {
                    if (context.copyToClipboard(code)) copied = true else status = Status(false, copyFailed)
                }
                OutlinedPill(stringResource(R.string.you_share), Modifier.weight(1f)) {
                    val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, code)
                    context.startActivity(Intent.createChooser(send, shareTitle))
                }
            }
        } else {
            Text(
                stringResource(R.string.you_noCode),
                modifier = Modifier.padding(top = 4.dp),
                style = TextStyle(fontFamily = Figtree, fontSize = 13.sp, color = ParkPassColors.Neutral600),
            )
        }

        Box(
            Modifier
                .padding(top = 6.dp)
                .fillMaxWidth()
                .height(1.dp)
                .background(ParkPassColors.Divider),
        )

        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.weight(1f)) { Label(stringResource(R.string.you_importLabel)) }
            Text(
                stringResource(R.string.you_paste),
                modifier = Modifier
                    .clickable {
                        context.readClipboard()?.let {
                            draft = it
                            status = null
                        }
                    }
                    .padding(horizontal = 4.dp, vertical = 8.dp),
                style = TextStyle(
                    fontFamily = Figtree,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = ParkPassColors.Accent700,
                    textDecoration = TextDecoration.Underline,
                ),
            )
        }
        BasicTextField(
            value = draft,
            onValueChange = {
                draft = it
                status = null
            },
            minLines = 2,
            maxLines = 4,
            cursorBrush = SolidColor(ParkPassColors.Accent),
            keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Characters, autoCorrectEnabled = false),
            textStyle = TextStyle(fontFamily = Mono, fontSize = 12.5.sp, lineHeight = 20.sp, color = ParkPassColors.Neutral800),
            modifier = Modifier.fillMaxWidth(),
            decorationBox = { inner ->
                Box(
                    Modifier
                        .fillMaxWidth()
                        .background(ParkPassColors.Neutral100, RoundedCornerShape(16.dp))
                        .border(1.dp, ParkPassColors.Divider, RoundedCornerShape(16.dp))
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                ) {
                    if (draft.isEmpty()) {
                        Text(
                            stringResource(R.string.you_importPlaceholder),
                            style = TextStyle(fontFamily = Mono, fontSize = 12.5.sp, lineHeight = 20.sp, color = ParkPassColors.Neutral500),
                        )
                    }
                    inner()
                }
            },
        )
        SolidPill(stringResource(R.string.you_import)) {
            val outcome = onImport(draft)
            status = messages(outcome)
            if (outcome is ImportOutcome.Merged) draft = ""
        }
        status?.let {
            Text(
                it.text,
                modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
                style = TextStyle(
                    fontFamily = Figtree,
                    fontSize = 13.sp,
                    lineHeight = (13 * 1.5).sp,
                    color = if (it.ok) ParkPassColors.Sage800 else ParkPassColors.Accent700,
                ),
            )
        }
    }
}

private sealed interface ImportOutcome {
    data class Failed(val error: Passcode.DecodeError) : ImportOutcome
    data class Merged(val added: Int, val updated: Int) : ImportOutcome
}

private fun importCode(raw: String, knownSlugs: Set<String>, visits: VisitStore): ImportOutcome =
    when (val result = Passcode.decode(raw, knownSlugs)) {
        is Passcode.DecodeResult.Error -> ImportOutcome.Failed(result.error)
        is Passcode.DecodeResult.Ok -> visits.merge(result.visits).let { ImportOutcome.Merged(it.added, it.updated) }
    }

/** Resolves every message up front so the click handler stays non-composable. */
@Composable
private fun importMessages(): (ImportOutcome) -> Status {
    val errors = mapOf(
        Passcode.DecodeError.EMPTY to stringResource(R.string.you_errorEmpty),
        Passcode.DecodeError.CHARSET to stringResource(R.string.you_errorCharset),
        Passcode.DecodeError.LENGTH to stringResource(R.string.you_errorLength),
        Passcode.DecodeError.CHECKSUM to stringResource(R.string.you_errorChecksum),
        Passcode.DecodeError.VERSION to stringResource(R.string.you_errorVersion),
    )
    val nothing = stringResource(R.string.you_importedNothing)
    val resources = LocalContext.current.resources
    return { outcome ->
        when (outcome) {
            is ImportOutcome.Failed -> Status(false, errors.getValue(outcome.error))
            is ImportOutcome.Merged -> {
                val parts = buildList {
                    if (outcome.added > 0) add(resources.getQuantityString(R.plurals.you_importedPins, outcome.added, outcome.added))
                    if (outcome.updated > 0) add(resources.getQuantityString(R.plurals.you_importedDates, outcome.updated, outcome.updated))
                }
                Status(true, if (parts.isEmpty()) nothing else parts.joinToString(" "))
            }
        }
    }
}

@Composable
private fun LanguageSwitch() {
    val lang = currentLang()
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        val base = TextStyle(fontFamily = Figtree, fontSize = 12.5.sp, color = ParkPassColors.Neutral600)
        Text("${stringResource(R.string.you_language)}:", style = base)
        Spacer(Modifier.width(8.dp))
        LanguageOption("Svenska", Lang.SV, lang == Lang.SV, base)
        Text(" · ", style = base)
        LanguageOption("English", Lang.EN, lang == Lang.EN, base)
    }
}

@Composable
private fun LanguageOption(label: String, option: Lang, active: Boolean, base: TextStyle) {
    Text(
        label,
        modifier = Modifier
            .clickable(enabled = !active) {
                // Recreates the activity in the new language and remembers it.
                AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(option.tag))
            }
            .padding(vertical = 10.dp, horizontal = 2.dp),
        style = if (active) {
            base.copy(fontWeight = FontWeight.Bold, color = ParkPassColors.Accent700)
        } else {
            base.copy(textDecoration = TextDecoration.Underline)
        },
    )
}

@Composable
private fun Footer() {
    val style = TextStyle(fontFamily = Figtree, fontSize = 11.5.sp, color = ParkPassColors.Neutral500, textAlign = TextAlign.Center)
    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(stringResource(R.string.you_honor), style = style)
        Text(stringResource(R.string.you_version, BuildConfig.VERSION_NAME), style = style, modifier = Modifier.padding(top = 4.dp))
    }
}

@Composable
private fun Card(color: Color, padding: androidx.compose.ui.unit.Dp, spacing: androidx.compose.ui.unit.Dp, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(color, CardShape)
            .padding(horizontal = 20.dp, vertical = padding),
        verticalArrangement = Arrangement.spacedBy(spacing),
        content = content,
    )
}

@Composable
private fun Label(text: String) {
    Text(
        text.uppercase(),
        modifier = Modifier.padding(top = 4.dp),
        style = TextStyle(
            fontFamily = Figtree,
            fontSize = 11.5.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.7.sp,
            color = ParkPassColors.Neutral600,
        ),
    )
}

@Composable
private fun OutlinedPill(label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(50),
        color = ParkPassColors.Transparent,
        border = BorderStroke(1.dp, ParkPassColors.Divider),
        modifier = modifier.heightIn(min = 48.dp),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(label, style = TextStyle(fontFamily = Caprasimo, fontSize = 14.sp, color = ParkPassColors.Ink))
        }
    }
}

@Composable
private fun SolidPill(label: String, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(50),
        color = ParkPassColors.Accent,
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(label, style = TextStyle(fontFamily = Caprasimo, fontSize = 14.sp, color = ParkPassColors.Ground))
        }
    }
}

private fun Context.copyToClipboard(text: String): Boolean = try {
    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.setPrimaryClip(ClipData.newPlainText("ParkPass", text))
    true
} catch (_: Exception) {
    false
}

private fun Context.readClipboard(): String? = try {
    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    clipboard.primaryClip?.takeIf { it.itemCount > 0 }?.getItemAt(0)?.coerceToText(this)?.toString()
} catch (_: Exception) {
    null
}
