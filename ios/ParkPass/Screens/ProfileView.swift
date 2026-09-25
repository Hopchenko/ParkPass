import SwiftUI
import UIKit

/// You tab — docs/specs/profile.md.
struct ProfileView: View {
    @Environment(VisitStore.self) private var visits
    @Environment(L10n.self) private var l10n
    @Environment(\.repository) private var repository

    @State private var draft = ""
    @State private var status: (ok: Bool, text: String)?
    @State private var copied = false

    private static let checklist = URL(string: "https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista")!

    var body: some View {
        let total = repository.parks.count
        let count = visits.visits.keys.filter(repository.slugs.contains).count
        // No pins means no code worth showing — an empty one transfers nothing.
        let code = count > 0 ? Passcode.encode(visits.visits) : nil

        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(l10n.t("you.title")).font(.heading(27)).foregroundStyle(Color.ink)
                progressCard(count: count, total: total)
                diplomaCard
                transferCard(code: code)
                languageSwitch
                footer
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 24)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Color.ground)
    }

    private func progressCard(count: Int, total: Int) -> some View {
        let fraction = total > 0 ? (Double(count) / Double(total) * 100).rounded() / 100 : 0
        return card(.surface, spacing: 12) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text(String(count)).font(.heading(44)).foregroundStyle(Color.accent700)
                Text(l10n.t("you.of31")).font(.figtree(17, .bold)).foregroundStyle(Color.neutral600)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.neutral300)
                    Capsule().fill(Color.accent).frame(width: geo.size.width * fraction)
                }
            }
            .frame(height: 14)
            .animation(.easeOut(duration: 0.5), value: fraction)
            Text(count >= total ? l10n.t("you.done") : l10n.t("you.toGo", ["count": String(total - count)]))
                .font(.figtree(13.5))
                .foregroundStyle(Color.neutral700)
        }
    }

    private var diplomaCard: some View {
        card(.sage200, spacing: 8) {
            Text(l10n.t("you.diplomaTitle")).font(.figtree(15, .heavy)).foregroundStyle(Color.sage900)
            Text(l10n.t("you.diplomaBody")).font(.figtree(13.5)).foregroundStyle(Color.sage800)
            Link(l10n.t("you.diplomaLink"), destination: Self.checklist)
                .font(.figtree(13.5, .bold))
                .foregroundStyle(Color.sage700)
        }
    }

    private func transferCard(code: String?) -> some View {
        card(.surface, spacing: 10) {
            Text(l10n.t("you.transferTitle")).font(.figtree(15, .heavy)).foregroundStyle(Color.ink)
            Text(l10n.t("you.transferBody")).font(.figtree(13.5)).foregroundStyle(Color.neutral700)

            if let code {
                FieldLabel(text: l10n.t("you.yourCode")).padding(.top, 4)
                Text(code)
                    .font(.system(size: 12.5, design: .monospaced))
                    .foregroundStyle(Color.neutral800)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(Color.neutral100, in: RoundedRectangle(cornerRadius: 16))
                HStack(spacing: 8) {
                    Button {
                        UIPasteboard.general.string = code
                        copied = true
                        Task { @MainActor in
                            try? await Task.sleep(for: .seconds(2))
                            copied = false
                        }
                    } label: {
                        outlined(copied ? l10n.t("you.copied") : l10n.t("you.copy"))
                    }
                    ShareLink(item: code) {
                        outlined(l10n.t("you.share"))
                    }
                }
                .buttonStyle(.plain)
            } else {
                Text(l10n.t("you.noCode"))
                    .font(.figtree(13))
                    .foregroundStyle(Color.neutral600)
                    .padding(.top, 4)
            }

            Rectangle().fill(Color.divider).frame(height: 1).padding(.top, 6)

            HStack {
                FieldLabel(text: l10n.t("you.importLabel"))
                Spacer()
                Button(l10n.t("you.paste")) {
                    if let text = UIPasteboard.general.string {
                        draft = text
                        status = nil
                    }
                }
                .font(.figtree(13, .bold))
                .underline()
                .foregroundStyle(Color.accent700)
            }
            // Editing the code clears the last import's result.
            TextField(l10n.t("you.importPlaceholder"), text: Binding(get: { draft }, set: { draft = $0; status = nil }), axis: .vertical)
                .lineLimit(2...4)
                .font(.system(size: 12.5, design: .monospaced))
                .foregroundStyle(Color.neutral800)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(Color.neutral100, in: RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.divider, lineWidth: 1))

            Button(action: importCode) {
                Text(l10n.t("you.import"))
                    .font(.heading(14))
                    .foregroundStyle(Color.ground)
                    .frame(maxWidth: .infinity, minHeight: 48)
                    .background(Color.accent, in: Capsule())
            }
            .buttonStyle(.plain)

            if let status {
                Text(status.text)
                    .font(.figtree(13))
                    .foregroundStyle(status.ok ? Color.sage800 : Color.accent700)
            }
        }
    }

    private func importCode() {
        switch Passcode.decode(draft, knownSlugs: repository.slugs) {
        case .failure(let error):
            let key: String = switch error {
            case .empty: "you.errorEmpty"
            case .charset: "you.errorCharset"
            case .length: "you.errorLength"
            case .checksum: "you.errorChecksum"
            case .version: "you.errorVersion"
            }
            status = (false, l10n.t(key))
        case .success(let incoming):
            let result = visits.merge(incoming)
            var parts: [String] = []
            if result.added > 0 { parts.append(l10n.t("you.importedPins", ["count": String(result.added)])) }
            if result.updated > 0 { parts.append(l10n.t("you.importedDates", ["count": String(result.updated)])) }
            draft = ""
            status = (true, parts.isEmpty ? l10n.t("you.importedNothing") : parts.joined(separator: " "))
        }
    }

    private var languageSwitch: some View {
        HStack(spacing: 6) {
            Text("\(l10n.t("you.language")):")
            languageOption("Svenska", .sv)
            Text("·")
            languageOption("English", .en)
        }
        .font(.figtree(12.5))
        .foregroundStyle(Color.neutral600)
        .frame(maxWidth: .infinity)
    }

    private func languageOption(_ label: String, _ lang: Lang) -> some View {
        let active = l10n.lang == lang
        return Button(label) { l10n.lang = lang }
            .font(.figtree(12.5, active ? .bold : .regular))
            .underline(!active)
            .foregroundStyle(active ? Color.accent700 : Color.neutral600)
            .disabled(active)
            .frame(minHeight: 44)
    }

    private var footer: some View {
        let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
        return VStack(spacing: 4) {
            Text(l10n.t("you.honor"))
            Text(l10n.t("you.version", ["version": version]))
        }
        .font(.figtree(11.5))
        .foregroundStyle(Color.neutral500)
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
    }

    private func outlined(_ label: String) -> some View {
        Text(label)
            .font(.heading(14))
            .foregroundStyle(Color.ink)
            .frame(maxWidth: .infinity, minHeight: 48)
            .overlay(Capsule().stroke(Color.divider, lineWidth: 1))
            .contentShape(Capsule())
    }

    private func card<Content: View>(_ color: Color, spacing: CGFloat, @ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: spacing, content: content)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 20)
            .padding(.vertical, 18)
            .background(color, in: RoundedRectangle(cornerRadius: 32))
    }
}
