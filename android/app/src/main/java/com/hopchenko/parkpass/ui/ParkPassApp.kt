package com.hopchenko.parkpass.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.hopchenko.parkpass.LocalParkRepository
import com.hopchenko.parkpass.R
import com.hopchenko.parkpass.data.ParkRepository
import com.hopchenko.parkpass.data.VisitStore
import com.hopchenko.parkpass.ui.board.PinBoardScreen
import com.hopchenko.parkpass.ui.components.ParkIcons
import com.hopchenko.parkpass.ui.detail.ParkDetailScreen
import com.hopchenko.parkpass.ui.map.MapScreen
import com.hopchenko.parkpass.ui.parks.ParkListScreen
import com.hopchenko.parkpass.ui.profile.ProfileScreen
import com.hopchenko.parkpass.ui.theme.Figtree
import com.hopchenko.parkpass.ui.theme.ParkPassColors

/** The four tabs, in bar order — docs/specs/navigation.md. */
enum class Tab(val route: String, val label: Int, val icon: ImageVector) {
    PARKS("parks", R.string.tabs_parks, ParkIcons.Parks),
    MAP("map", R.string.tabs_map, ParkIcons.Map),
    BOARD("board", R.string.tabs_board, ParkIcons.Board),
    YOU("you", R.string.tabs_you, ParkIcons.You),
    ;

    companion object {
        fun fromRoute(route: String?): Tab? = entries.firstOrNull { it.route == route }
    }
}

private const val DETAIL_ROUTE = "park/{slug}?from={from}"

private fun NavHostController.openPark(slug: String, from: Tab) = navigate("park/$slug?from=${from.route}")

private fun NavHostController.openTab(tab: Tab) = navigate(tab.route) {
    // One stack rooted at Parks: switching tabs drops any open park page.
    popUpTo(graph.findStartDestination().id)
    launchSingleTop = true
}

@Composable
fun ParkPassApp(parks: ParkRepository, visits: VisitStore) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val visited by visits.visits.collectAsStateWithLifecycle()

    // On a park page the tab it was opened from stays highlighted.
    val route = backStack?.destination?.route
    val activeTab = Tab.fromRoute(route)
        ?: Tab.fromRoute(backStack?.arguments?.getString("from"))
        ?: Tab.PARKS

    CompositionLocalProvider(LocalParkRepository provides parks) {
        Scaffold(
            containerColor = ParkPassColors.Ground,
            bottomBar = { TabBar(activeTab) { navController.openTab(it) } },
        ) { padding ->
            NavHost(
                navController = navController,
                startDestination = Tab.PARKS.route,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .consumeWindowInsets(padding)
                    .imePadding(),
            ) {
                composable(Tab.PARKS.route) {
                    ParkListScreen(parks.parks, visited) { navController.openPark(it, Tab.PARKS) }
                }
                composable(Tab.MAP.route) {
                    MapScreen(parks, visited) { navController.openPark(it, Tab.MAP) }
                }
                composable(Tab.BOARD.route) {
                    PinBoardScreen(parks.parks, visited) { navController.openPark(it, Tab.BOARD) }
                }
                composable(Tab.YOU.route) {
                    ProfileScreen(parkCount = parks.parks.size, knownSlugs = parks.slugs, visits = visits)
                }
                composable(
                    DETAIL_ROUTE,
                    arguments = listOf(
                        navArgument("slug") { type = NavType.StringType },
                        navArgument("from") {
                            type = NavType.StringType
                            defaultValue = Tab.PARKS.route
                        },
                    ),
                ) { entry ->
                    val park = parks.park(entry.arguments?.getString("slug").orEmpty())
                    val origin = Tab.fromRoute(entry.arguments?.getString("from")) ?: Tab.PARKS
                    if (park != null) {
                        ParkDetailScreen(
                            park = park,
                            visitDate = visited[park.slug],
                            backLabel = stringResource(origin.label),
                            onBack = { navController.popBackStack() },
                            onMark = { visits.mark(park.slug) },
                            onUnmark = { visits.unmark(park.slug) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TabBar(active: Tab, onSelect: (Tab) -> Unit) {
    Column(Modifier.background(ParkPassColors.Neutral100)) {
        Spacer(
            Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(ParkPassColors.Divider),
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(start = 10.dp, end = 10.dp, top = 6.dp, bottom = 4.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            Tab.entries.forEach { tab ->
                val selected = tab == active
                val color = if (selected) ParkPassColors.Accent700 else ParkPassColors.Neutral500
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 52.dp)
                        .semantics { this.selected = selected }
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                            role = Role.Tab,
                        ) { onSelect(tab) },
                    contentAlignment = Alignment.Center,
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(top = 8.dp, bottom = 6.dp),
                    ) {
                        Icon(tab.icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
                        Spacer(Modifier.height(3.dp))
                        Text(
                            stringResource(tab.label),
                            style = TextStyle(fontFamily = Figtree, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = color),
                        )
                    }
                }
            }
        }
    }
}
