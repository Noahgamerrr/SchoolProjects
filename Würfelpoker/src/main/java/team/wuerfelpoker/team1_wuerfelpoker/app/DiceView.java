package team.wuerfelpoker.team1_wuerfelpoker.app;

import javafx.animation.RotateTransition;
import javafx.animation.TranslateTransition;
import javafx.scene.image.ImageView;
import javafx.util.Duration;
import team.wuerfelpoker.team1_wuerfelpoker.util.ResourceManager;

import java.util.Random;

public class DiceView extends ImageView {

    boolean selected = false;
    int value = 0;

    public boolean isSelected() {
        return selected;
    }

    public void setSelected(boolean selected) {
        this.selected = selected;
    }

    boolean hidden = true;

    Random random = new Random();
    public DiceView(double sizeMult, int value, boolean hidden) {
        this.setScaleX(sizeMult);
        this.setScaleY(sizeMult);
        this.value = value;
        this.hidden = hidden;
        refreshValue();
    }
    public DiceView(double sizeMult, boolean hidden) {
        this.setScaleX(sizeMult);
        this.setScaleY(sizeMult);
        this.value = random.nextInt(6)+1;
        this.hidden = hidden;

        refreshValue();
    }

    public DiceView(double sizeMult, boolean hidden, int value) {
        this.setScaleX(sizeMult);
        this.setScaleY(sizeMult);
        this.value = value;
        this.hidden = hidden;

        refreshValue();
    }

    public void refreshValue(int value) {
        this.value = value;
        refreshValue();
    }
    public void refreshValue() {
        if (hidden) {
            this.setImage(ResourceManager.getInstance().getDices()[6]);
        } else {
            if (selected)
                this.setImage(ResourceManager.getInstance().getSelectedDices()[this.value-1]);
            else
                this.setImage(ResourceManager.getInstance().getDices()[this.value-1]);
        }
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }
}
