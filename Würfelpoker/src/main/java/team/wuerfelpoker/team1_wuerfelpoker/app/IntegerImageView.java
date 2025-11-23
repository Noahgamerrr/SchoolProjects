package team.wuerfelpoker.team1_wuerfelpoker.app;

import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

public class IntegerImageView extends ImageView {

    int index = 0;
    public IntegerImageView(Image image, int index) {
        super(image);
        this.index = index;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int id) {
        this.index = index;
    }
}
