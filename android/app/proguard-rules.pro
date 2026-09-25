# kotlinx.serialization — keep generated serializers for the shared/*.json models.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class com.hopchenko.parkpass.core.** {
    *** Companion;
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.hopchenko.parkpass.core.**$$serializer { *; }
