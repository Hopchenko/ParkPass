import SwiftUI
import UIKit

/// Park page — docs/specs/park-detail.md. The stamp moment ports the web's
/// @keyframes (globals.css) number for number via keyframe animators.
struct ParkDetailView: View {
    let park: Park
    @Environment(VisitStore.self) private var visits
    @Environment(L10n.self) private var l10n

    /// Bumped on every pin; drives the stamp-in and press animations.
    @State private var stampRun = 0
    @State private var confettiStart: Date?
    /// Last shown date, so the stamp keeps its text while it fades on undo.
    @State private var stampISO: String?

    private var visitDate: String? { visits.visits[park.slug] }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                pin
                    .padding(.top, 8)
                    .padding(.bottom, 4)

                Text(park.name)
                    .font(.heading(29))
                    .foregroundStyle(Color.ink)
                    .multilineTextAlignment(.center)
                    .padding(.top, 12)
                    .padding(.bottom, 2)
                if let sami = park.sami {
                    Text(sami).font(.figtree(14)).italic().foregroundStyle(Color.neutral600)
                }

                HStack(spacing: 8) {
                    Pill(text: park.region[l10n.lang], background: .sage100, foreground: .sage800)
                    Pill(text: l10n.t("detail.est", ["year": String(park.year)]), background: .neutral100, foreground: .neutral800)
                    Pill(text: l10n.t("detail.area", ["area": l10n.area(park.area)]), background: .neutral100, foreground: .neutral800)
                }
                .padding(.top, 16)
                .padding(.bottom, 18)

                Text(park.description[l10n.lang])
                    .font(.figtree(15))
                    .lineSpacing(4)
                    .foregroundStyle(Color.neutral800)
                    .multilineTextAlignment(.center)
                    .padding(.bottom, 22)

                // One fixed-height slot for both states, so toggling never moves the page.
                Group {
                    if let visitDate {
                        pinnedCard(visitDate)
                    } else {
                        Button(action: pinIt) {
                            Text(l10n.t("detail.pinIt"))
                                .font(.heading(16))
                                .foregroundStyle(Color.ground)
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                                .background(Color.accent, in: Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .frame(height: 60)
                .padding(.bottom, 12)

                if let url = URL(string: park.officialUrl[l10n.lang]) {
                    Link(destination: url) {
                        Text(l10n.t("detail.official"))
                            .font(.heading(14))
                            .foregroundStyle(Color.accent)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: .infinity, minHeight: 48)
                    }
                }

                // Height is reserved whether or not the park is stamped.
                stamp
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .frame(height: 172)
                    .padding(.trailing, 4)

                Text(l10n.t("detail.disclaimer"))
                    .font(.figtree(11.5))
                    .foregroundStyle(Color.neutral500)
                    .multilineTextAlignment(.center)
                    .padding(.top, 32)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 28)
        }
        .background(Color.ground)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { stampISO = visitDate }
    }

    private var pin: some View {
        ZStack {
            PinBadge(park: park, look: visitDate != nil ? .full : .detailUnpinned)
                .frame(width: 210, height: 210)
                .keyframeAnimator(initialValue: Frame(), trigger: stampRun) { content, f in
                    content
                        .scaleEffect(f.scale)
                        .rotationEffect(.degrees(f.rotation))
                        .opacity(f.opacity)
                } keyframes: { _ in
                    // stampIn: .55s, cubic-bezier(.2,1.4,.4,1) per segment.
                    KeyframeTrack(\.scale) {
                        MoveKeyframe(2.4)
                        LinearKeyframe(0.9, duration: 0.3025, timingCurve: Curves.stampIn)
                        LinearKeyframe(1.06, duration: 0.11, timingCurve: Curves.stampIn)
                        LinearKeyframe(1, duration: 0.1375, timingCurve: Curves.stampIn)
                    }
                    KeyframeTrack(\.rotation) {
                        MoveKeyframe(-16)
                        LinearKeyframe(3, duration: 0.3025, timingCurve: Curves.stampIn)
                        LinearKeyframe(-1, duration: 0.11, timingCurve: Curves.stampIn)
                        LinearKeyframe(0, duration: 0.1375, timingCurve: Curves.stampIn)
                    }
                    KeyframeTrack(\.opacity) {
                        MoveKeyframe(0)
                        LinearKeyframe(1, duration: 0.3025, timingCurve: Curves.stampIn)
                        LinearKeyframe(1, duration: 0.2475)
                    }
                }

            if let confettiStart {
                TimelineView(.animation) { timeline in
                    Confetti(elapsed: timeline.date.timeIntervalSince(confettiStart))
                }
                .allowsHitTesting(false)
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: 210)
    }

    /// Always in the hierarchy so the press animation can run the moment a
    /// park is pinned; hidden while unpinned.
    private var stamp: some View {
        VisitStamp(iso: stampISO ?? Visits.todayISO())
            .frame(width: 164, height: 164)
            .keyframeAnimator(initialValue: Frame(scale: 1, rotation: -15, opacity: 0.85), trigger: stampRun) { content, f in
                content
                    .scaleEffect(f.scale)
                    .rotationEffect(.degrees(f.rotation))
                    .opacity(f.opacity)
            } keyframes: { _ in
                // stampPress: .45s after a .25s delay, cubic-bezier(.6,.04,.98,.335).
                KeyframeTrack(\.scale) {
                    MoveKeyframe(1.9)
                    LinearKeyframe(1.9, duration: 0.25)
                    LinearKeyframe(1, duration: 0.45, timingCurve: Curves.press)
                }
                KeyframeTrack(\.rotation) {
                    MoveKeyframe(-2)
                    LinearKeyframe(-2, duration: 0.25)
                    LinearKeyframe(-15, duration: 0.45, timingCurve: Curves.press)
                }
                KeyframeTrack(\.opacity) {
                    MoveKeyframe(0)
                    LinearKeyframe(0, duration: 0.25)
                    LinearKeyframe(0.9, duration: 0.2475, timingCurve: Curves.press)
                    LinearKeyframe(0.85, duration: 0.2025, timingCurve: Curves.press)
                }
            }
            .opacity(visitDate == nil ? 0 : 1)
            .accessibilityHidden(visitDate == nil)
    }

    private func pinnedCard(_ date: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark")
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(Color.sage700)
            Text(l10n.t("detail.pinned", ["date": l10n.visitDate(date)]))
                .font(.figtree(15, .bold))
                .foregroundStyle(Color.sage800)
            Button(l10n.t("detail.undo"), action: undo)
                .font(.figtree(13, .semibold))
                .underline()
                .foregroundStyle(Color.sage700)
                .frame(minHeight: 44)
                .padding(.horizontal, 8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.sage200, in: RoundedRectangle(cornerRadius: 16))
    }

    private func pinIt() {
        visits.mark(park.slug)
        stampISO = visitDate
        stampRun += 1
        let start = Date()
        confettiStart = start
        Task { @MainActor in
            // The pin lands at the 55% keyframe.
            try? await Task.sleep(for: .milliseconds(300))
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            try? await Task.sleep(for: .milliseconds(1000))
            if confettiStart == start { confettiStart = nil }
        }
    }

    private func undo() {
        confettiStart = nil
        visits.unmark(park.slug)
    }
}

/// Animated properties shared by the pin and the stamp.
private struct Frame {
    var scale = 1.0
    var rotation = 0.0
    var opacity = 1.0
}

private enum Curves {
    static let stampIn = UnitCurve.bezier(startControlPoint: UnitPoint(x: 0.2, y: 1.4), endControlPoint: UnitPoint(x: 0.4, y: 1))
    static let press = UnitCurve.bezier(startControlPoint: UnitPoint(x: 0.6, y: 0.04), endControlPoint: UnitPoint(x: 0.98, y: 0.335))
}
