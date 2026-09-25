package com.hopchenko.parkpass.ui.parks

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.core.Lang
import com.hopchenko.parkpass.core.Park
import com.hopchenko.parkpass.core.VisitedMap
import com.hopchenko.parkpass.data.currentLang
import com.hopchenko.parkpass.data.formatArea
import com.hopchenko.parkpass.data.formatVisitDate
import com.hopchenko.parkpass.ui.components.CountChip
import com.hopchenko.parkpass.ui.components.ParkIcons
import com.hopchenko.parkpass.ui.components.PinBadge
import com.hopchenko.parkpass.ui.components.PinLook
import com.hopchenko.parkpass.ui.theme.Caprasimo
import com.hopchenko.parkpass.ui.theme.Figtree
import com.hopchenko.parkpass.ui.theme.ParkPassColors

private enum class Chip { ALL, PINNED, TODO }

/** Search matches name, Sámi name and region, AND-ed with the chip. */
private fun filter(parks: List<Park>, visited: VisitedMap, query: String, chip: Chip, lang: Lang): List<Park> {
    val q = query.trim().lowercase()
    return parks.filter { p ->
        val matches = q.isEmpty() || "${p.name} ${p.sami.orEmpty()} ${p.region[lang]}".lowercase().contains(q)
        matches && when (chip) {
            Chip.ALL -> true
            Chip.PINNED -> p.slug in visited
            Chip.TODO -> p.slug !in visited
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ParkListScreen(parks: List<Park>, visited: VisitedMap, onOpen: (String) -> Unit) {
    val lang = currentLang()
    var query by rememberSaveable { mutableStateOf("") }
    var chip by rememberSaveable { mutableStateOf(Chip.ALL) }
    val listState = rememberLazyListState()
    val count = parks.count { it.slug in visited }
    val shown = remember(parks, visited, query, chip, lang) { filter(parks, visited, query, chip, lang) }

    // The filter bar gets a shadow once the header has scrolled under it.
    val stuck by remember { derivedStateOf { listState.firstVisibleItemIndex > 0 } }
    val barElevation by animateDpAsState(if (stuck) 6.dp else 0.dp, tween(200), label = "barShadow")

    LazyColumn(state = listState, modifier = Modifier.fillMaxWidth()) {
        item(key = "header") { Header(count) }

        stickyHeader(key = "filters") {
            Surface(color = ParkPassColors.Ground, shadowElevation = barElevation) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp, vertical = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    SearchField(query) { query = it }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(stringResource(R.string.parks_chipAll), chip == Chip.ALL) { chip = Chip.ALL }
                        FilterChip(stringResource(R.string.parks_chipPinned), chip == Chip.PINNED) { chip = Chip.PINNED }
                        FilterChip(stringResource(R.string.parks_chipTodo), chip == Chip.TODO) { chip = Chip.TODO }
                    }
                }
            }
        }

        items(shown, key = { it.slug }) { park ->
            ParkRow(park, visited[park.slug], lang) { onOpen(park.slug) }
        }

        if (shown.isEmpty()) {
            item(key = "empty") {
                Text(
                    stringResource(R.string.parks_noResults),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 40.dp),
                    style = TextStyle(fontFamily = Figtree, fontSize = 14.sp, color = ParkPassColors.Neutral600, textAlign = TextAlign.Center),
                )
            }
        }
    }
}

@Composable
private fun Header(count: Int) {
    Column(Modifier.padding(start = 18.dp, end = 18.dp, top = 16.dp, bottom = 6.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(R.string.parks_title), style = TextStyle(fontFamily = Caprasimo, fontSize = 27.sp, color = ParkPassColors.Ink))
                Spacer(Modifier.width(8.dp))
                Text("🇸🇪", fontSize = 21.sp)
            }
            CountChip(stringResource(R.string.parks_pinnedCount, count))
        }
        Text(
            stringResource(R.string.parks_subtitle),
            style = TextStyle(fontFamily = Figtree, fontSize = 13.5.sp, lineHeight = 17.sp, color = ParkPassColors.Neutral600),
        )
    }
}

@Composable
private fun SearchField(value: String, onChange: (String) -> Unit) {
    val interaction = remember { MutableInteractionSource() }
    val focused by interaction.collectIsFocusedAsState()
    BasicTextField(
        value = value,
        onValueChange = onChange,
        singleLine = true,
        interactionSource = interaction,
        cursorBrush = SolidColor(ParkPassColors.Accent),
        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
        textStyle = TextStyle(fontFamily = Figtree, fontSize = 15.sp, color = ParkPassColors.Ink),
        modifier = Modifier.fillMaxWidth(),
        decorationBox = { inner ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 44.dp)
                    .background(ParkPassColors.Surface, RoundedCornerShape(50))
                    .border(1.dp, if (focused) ParkPassColors.Accent else ParkPassColors.Divider, RoundedCornerShape(50))
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.CenterStart,
            ) {
                if (value.isEmpty()) {
                    Text(
                        stringResource(R.string.parks_searchPlaceholder),
                        style = TextStyle(fontFamily = Figtree, fontSize = 15.sp, color = ParkPassColors.Neutral500),
                    )
                }
                inner()
            }
        },
    )
}

@Composable
private fun FilterChip(label: String, active: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(50),
        color = if (active) ParkPassColors.Accent else ParkPassColors.Transparent,
        border = BorderStroke(1.5.dp, if (active) ParkPassColors.Accent else ParkPassColors.Neutral400),
    ) {
        Text(
            label,
            modifier = Modifier.padding(horizontal = 15.dp, vertical = 9.dp),
            style = TextStyle(
                fontFamily = Figtree,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = if (active) ParkPassColors.Neutral100 else ParkPassColors.Neutral700,
            ),
        )
    }
}

@Composable
private fun ParkRow(park: Park, visitDate: String?, lang: Lang, onClick: () -> Unit) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(horizontal = 18.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            PinBadge(
                park = park,
                modifier = Modifier.size(100.dp),
                look = if (visitDate != null) PinLook.Full else PinLook.ListUnpinned,
                strokeWidth = 2.6f,
            )
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    park.name,
                    style = TextStyle(fontFamily = Figtree, fontSize = 18.sp, lineHeight = 22.sp, fontWeight = FontWeight.Bold, color = ParkPassColors.Ink),
                )
                park.sami?.let {
                    Text(
                        it,
                        modifier = Modifier.padding(top = 2.dp),
                        style = TextStyle(fontFamily = Figtree, fontSize = 13.sp, fontStyle = FontStyle.Italic, color = ParkPassColors.Neutral500),
                    )
                }
                Text(
                    stringResource(R.string.parks_meta, park.region[lang], park.year.toString(), formatArea(park.area, lang)),
                    modifier = Modifier.padding(top = 4.dp),
                    style = TextStyle(fontFamily = Figtree, fontSize = 13.sp, lineHeight = 17.sp, color = ParkPassColors.Neutral600),
                )
                if (visitDate != null) {
                    Row(Modifier.padding(top = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(ParkIcons.Check, contentDescription = null, tint = ParkPassColors.Sage700, modifier = Modifier.size(14.dp))
                        Spacer(Modifier.width(4.dp))
                        Text(
                            stringResource(R.string.detail_pinned, formatVisitDate(visitDate, lang)),
                            style = TextStyle(fontFamily = Figtree, fontSize = 12.5.sp, fontWeight = FontWeight.SemiBold, color = ParkPassColors.Sage700),
                        )
                    }
                }
            }
        }
        HorizontalDivider(thickness = 1.dp, color = ParkPassColors.Divider)
    }
}
