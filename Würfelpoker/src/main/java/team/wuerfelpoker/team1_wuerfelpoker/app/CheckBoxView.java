package team.wuerfelpoker.team1_wuerfelpoker.app;

import javafx.scene.image.ImageView;
import team.wuerfelpoker.team1_wuerfelpoker.util.ResourceManager;

public class CheckBoxView extends ImageView {
    private boolean checked;

    public CheckBoxView() {
        checked = false;
        setImage();
    }

    public CheckBoxView(boolean checked) {
        this.checked = checked;
        setImage();
    }

    private void setImage() {
        if (checked) this.setImage(ResourceManager.getImage("checked.png"));
        else this.setImage(ResourceManager.getImage("unchecked.png"));
    }

    public boolean isChecked() {
        return checked;
    }

    public void setChecked(boolean checked) {
        this.checked = checked;
        setImage();
    }
}
