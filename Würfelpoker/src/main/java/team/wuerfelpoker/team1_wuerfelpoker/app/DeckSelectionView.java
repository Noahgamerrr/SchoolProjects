package team.wuerfelpoker.team1_wuerfelpoker.app;

import javafx.animation.TranslateTransition;
import javafx.scene.image.ImageView;
import javafx.util.Duration;
import team.wuerfelpoker.team1_wuerfelpoker.util.ResourceManager;

public class DeckSelectionView extends ImageView {
    private int value;
    boolean selected = false;

    public DeckSelectionView(int value) {
        this.value = value;
        setImage();
    }

    public DeckSelectionView(int value, boolean selected) {
        this.selected = selected;
        this.value = value;
        setImage();
    }

    private void selectTransition() {
        TranslateTransition tr = new TranslateTransition();
        tr.setByY(-20);
        tr.setNode(this);
        tr.setDuration(Duration.millis(100));
        tr.play();
    }

    private void unselectTransition() {
        TranslateTransition tr = new TranslateTransition();
        tr.setByY(20);
        tr.setNode(this);
        tr.setDuration(Duration.millis(100));
        tr.play();
    }


    public void select() {
        if (!selected) {
            selected = true;
            selectTransition();
        }
    }

    public void unselect() {
        if (selected) {
            selected = false;
            unselectTransition();
        }
    }

    private void setImage() {
        this.setImage(ResourceManager.getImage("deck" +value +".png"));
    }

    public int getValue() {
        return value;
    }
}
