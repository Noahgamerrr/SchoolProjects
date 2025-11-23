package team.wuerfelpoker.team1_wuerfelpoker.app;

import java.util.LinkedList;
import java.util.List;

public class CheckBoxRadio {
    private final List<CheckBoxView> checkBoxes = new LinkedList<>();

    public void addCheckBox(CheckBoxView checkBox) {
        checkBox.setOnMouseClicked(event -> checkBox(checkBox));
        checkBoxes.add(checkBox);
    }

    public void addAll(CheckBoxView... checkBoxes) {
        for (CheckBoxView c : checkBoxes) addCheckBox(c);
    }

    public boolean checkBox(CheckBoxView checkBox) {
        if (!checkBoxes.contains(checkBox)) return false;
        for (CheckBoxView c : checkBoxes) {
            if (c.equals(checkBox)) c.setChecked(true);
            else c.setChecked(false);
        }
        return true;
    }
}
