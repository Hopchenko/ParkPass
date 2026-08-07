/**
 * The single source of truth for the artwork's ownership metadata.
 *
 * Two scripts write it: stamp-copyright.mjs splices it into the source PNGs,
 * and pins-to-webp.mjs bakes it into the WebP files the site actually serves.
 * They share this module so a downloaded pin can never carry a stale notice.
 */

export const HOLDER = "Oleksii Hopchenko";
export const YEAR = 2026;
export const NOTICE = `© ${YEAR} ${HOLDER}. All rights reserved.`;
export const RIGHTS =
  "No reuse, redistribution or derivative works without permission.";
export const SOURCE = "https://github.com/Hopchenko/ParkPass";

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** An XMP packet asserting authorship and withholding reuse rights. */
export function xmpPacket(title) {
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(title)}</rdf:li></rdf:Alt></dc:title>
   <dc:creator><rdf:Seq><rdf:li>${escapeXml(HOLDER)}</rdf:li></rdf:Seq></dc:creator>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(NOTICE)}</rdf:li></rdf:Alt></dc:rights>
   <xmpRights:Marked>True</xmpRights:Marked>
   <xmpRights:WebStatement>${escapeXml(SOURCE)}</xmpRights:WebStatement>
   <xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(RIGHTS)}</rdf:li></rdf:Alt></xmpRights:UsageTerms>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

/** EXIF IFD0 tags, for the many viewers that read EXIF but not XMP. */
export const exifIfd0 = () => ({
  IFD0: { Artist: HOLDER, Copyright: NOTICE },
});
