package com.hopchenko.parkpass.data

import android.content.Context
import android.graphics.BitmapFactory
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.produceState
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import com.hopchenko.parkpass.core.MapData
import com.hopchenko.parkpass.core.Park
import com.hopchenko.parkpass.core.ParkData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

/**
 * The park dataset, map geometry and pin artwork, all read from assets the
 * build copies in from shared/ and parkpass-web/public/.
 */
class ParkRepository(context: Context) {
    private val assets = context.applicationContext.assets

    val parks: List<Park> = ParkData.parse(assets.open("parks.json").bufferedReader().use { it.readText() })
    val map: MapData = MapData.parse(assets.open("map.json").bufferedReader().use { it.readText() })

    private val bySlug = parks.associateBy { it.slug }
    val slugs: Set<String> = bySlug.keys

    fun park(slug: String): Park? = bySlug[slug]

    private val images = ConcurrentHashMap<String, ImageBitmap>()

    /** Cached decode of an asset image; call off the main thread. */
    fun image(path: String): ImageBitmap? = images[path] ?: try {
        assets.open(path).use { BitmapFactory.decodeStream(it) }
            ?.asImageBitmap()
            ?.also { images[path] = it }
    } catch (_: Exception) {
        null
    }

    fun cachedImage(path: String): ImageBitmap? = images[path]

    companion object {
        fun artworkPath(slug: String) = "pins/$slug.webp"
        const val FABRIC_PATH = "pinboard-fabric-seamless.webp"
    }
}

/** Loads an asset image on a background thread, instantly when cached. */
@Composable
fun rememberAssetImage(repository: ParkRepository, path: String?): State<ImageBitmap?> =
    produceState(initialValue = path?.let(repository::cachedImage), repository, path) {
        if (path != null && value == null) {
            value = withContext(Dispatchers.IO) { repository.image(path) }
        }
    }
