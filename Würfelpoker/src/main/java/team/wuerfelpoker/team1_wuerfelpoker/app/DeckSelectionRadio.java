package team.wuerfelpoker.team1_wuerfelpoker.app;

import java.util.LinkedList;
import java.util.List;

public class DeckSelectionRadio {
    private final List<DeckSelectionView> decks = new LinkedList<>();
    private int value = 0;

    public void setValue(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public void addDeck(DeckSelectionView deck) {
        deck.setOnMouseClicked(event -> {
            value = deck.getValue();
            select(deck);
        });
        decks.add(deck);
    }

    public void addAll(DeckSelectionView... decks) {
        for (DeckSelectionView d : decks) addDeck(d);
    }

    public boolean select(DeckSelectionView deck) {
        if (!decks.contains(deck)) return false;
        for (DeckSelectionView d : decks) {
            if (d.equals(deck)) d.select();
            else d.unselect();
        }
        return true;
    }
}
