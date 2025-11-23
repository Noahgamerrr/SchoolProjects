package team.wuerfelpoker.team1_wuerfelpoker.app;

import javafx.animation.TranslateTransition;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import javafx.util.Duration;

public class CardView extends ImageView {
    boolean moving = false;

    public boolean isMoving() {
        return moving;
    }

    public void setMoving(boolean moving) {
        this.moving = moving;
    }
    int index = 0;
    Runnable run;
    StackPane pane;

    String name;
    public CardView(Image image, Runnable run, StackPane pane, int index, String name) {
        this.setImage(image);;
        this.pane = pane;
        this.run = run;
        this.index = index;
        this.name = name;
    }

    public CardView(Image image, Runnable run, StackPane pane, String name) {
        this.setImage(image);;
        this.pane = pane;
        this.run = run;
        this.name = name;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    public void runCard() {
        if (run != null) {
            run.run();
            run = null;
            moving = true;
            TranslateTransition dissapear = new TranslateTransition();

            dissapear.setNode(this);
            dissapear.setFromY(this.getTranslateY());
            dissapear.setToY(-400);
            dissapear.setDuration(Duration.seconds(1));
            dissapear.setOnFinished(actionEvent -> {
                pane.getChildren().remove(this);
            });
            dissapear.play();
        }

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CardView cloneCard() {
        return new CardView(this.getImage(), this.run, this.pane, this.index, this.name);
    }
}
