import SwiftUI

/// Parks tab — docs/specs/park-list.md.
struct ParkListView: View {
    @Environment(VisitStore.self) private var visits
    @Environment(L10n.self) private var l10n
    @Environment(\.repository) private var repository
    @State private var query = ""
    @State private var chip = Chip.all

    enum Chip { case all, pinned, todo }

    /// Search matches name, Sámi name and region, AND-ed with the chip.
    private var shown: [Park] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        return repository.parks.filter { p in
            let matches = q.isEmpty || "\(p.name) \(p.sami ?? "") \(p.region[l10n.lang])".lowercased().contains(q)
            switch chip {
            case .all: return matches
            case .pinned: return matches && visits.visits[p.slug] != nil
            case .todo: return matches && visits.visits[p.slug] == nil
            }
        }
    }

    var body: some View {
        let count = repository.parks.filter { visits.visits[$0.slug] != nil }.count
        ScrollView {
            LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                header(count)
                Section {
                    ForEach(shown) { park in
                        NavigationLink(value: ParkRoute(slug: park.slug)) {
                            ParkRow(park: park, visitDate: visits.visits[park.slug])
                        }
                        .buttonStyle(.plain)
                    }
                    if shown.isEmpty {
                        Text(l10n.t("parks.noResults"))
                            .font(.figtree(14))
                            .foregroundStyle(Color.neutral600)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 40)
                    }
                } header: {
                    filterBar
                }
            }
        }
        .scrollDismissesKeyboard(.immediately)
        .background(Color.ground)
    }

    private func header(_ count: Int) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text(l10n.t("parks.title")).font(.heading(27)).foregroundStyle(Color.ink)
                Text("🇸🇪").font(.system(size: 21))
                Spacer()
                Pill(text: l10n.t("parks.pinnedCount", ["count": String(count)]))
            }
            Text(l10n.t("parks.subtitle"))
                .font(.figtree(13.5))
                .foregroundStyle(Color.neutral600)
        }
        .padding(.horizontal, 18)
        .padding(.top, 16)
        .padding(.bottom, 6)
    }

    /// Stays pinned to the top while the list scrolls.
    private var filterBar: some View {
        VStack(alignment: .leading, spacing: 12) {
            TextField(l10n.t("parks.searchPlaceholder"), text: $query)
                .font(.figtree(15))
                .foregroundStyle(Color.ink)
                .autocorrectionDisabled()
                .submitLabel(.search)
                .padding(.horizontal, 16)
                .frame(minHeight: 44)
                .background(Color.surface, in: Capsule())
                .overlay(Capsule().stroke(Color.divider, lineWidth: 1))
            HStack(spacing: 8) {
                chipButton(l10n.t("parks.chipAll"), .all)
                chipButton(l10n.t("parks.chipPinned"), .pinned)
                chipButton(l10n.t("parks.chipTodo"), .todo)
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 10)
        .background(Color.ground)
    }

    private func chipButton(_ label: String, _ value: Chip) -> some View {
        let active = chip == value
        return Button { chip = value } label: {
            Text(label)
                .font(.figtree(13, .bold))
                .foregroundStyle(active ? Color.neutral100 : Color.neutral700)
                .padding(.horizontal, 15)
                .padding(.vertical, 9)
                .background(active ? Color.accent : .clear, in: Capsule())
                .overlay(Capsule().stroke(active ? Color.accent : Color.neutral400, lineWidth: 1.5))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(active ? .isSelected : [])
    }
}

private struct ParkRow: View {
    let park: Park
    let visitDate: String?
    @Environment(L10n.self) private var l10n

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 16) {
                PinBadge(park: park, look: visitDate != nil ? .full : .listUnpinned)
                    .frame(width: 100, height: 100)
                VStack(alignment: .leading, spacing: 0) {
                    Text(park.name)
                        .font(.figtree(18, .bold))
                        .foregroundStyle(Color.ink)
                    if let sami = park.sami {
                        Text(sami)
                            .font(.figtree(13))
                            .italic()
                            .foregroundStyle(Color.neutral500)
                            .padding(.top, 2)
                    }
                    Text(l10n.t("parks.meta", [
                        "region": park.region[l10n.lang],
                        "year": String(park.year),
                        "area": l10n.area(park.area),
                    ]))
                    .font(.figtree(13))
                    .foregroundStyle(Color.neutral600)
                    .padding(.top, 4)
                    if let visitDate {
                        Label(l10n.t("detail.pinned", ["date": l10n.visitDate(visitDate)]), systemImage: "checkmark")
                            .font(.figtree(12.5, .semibold))
                            .foregroundStyle(Color.sage700)
                            .padding(.top, 6)
                    }
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
            Rectangle().fill(Color.divider).frame(height: 1)
        }
    }
}
