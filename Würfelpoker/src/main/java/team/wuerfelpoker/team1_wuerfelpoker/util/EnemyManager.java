package team.wuerfelpoker.team1_wuerfelpoker.util;

import javafx.animation.RotateTransition;
import javafx.animation.TranslateTransition;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import javafx.util.Duration;
import team.wuerfelpoker.team1_wuerfelpoker.GameController;
import team.wuerfelpoker.team1_wuerfelpoker.app.DiceView;

import java.util.LinkedList;

public class EnemyManager {
    public static DiceView rollEnemyDices(LinkedList<DiceView> dices, int directonMult, StackPane pane, int index, boolean hidden, int value) {
        DiceView dice = new DiceView(0.7, true, value);
        dices.add(dice);
        pane.getChildren().add(dice);
        dice.setTranslateX(80 * directonMult);
        dice.setTranslateY(-240);
            /*dice.setOnMouseClicked(mouseEvent -> {
                clickDice(dice);
            });*/
        dice.setOnMouseEntered(mouseEvent -> {
            RotateTransition diceRollTransition = new RotateTransition();
            diceRollTransition.setNode(dice);
            diceRollTransition.setToAngle(0);
            diceRollTransition.setFromAngle(-5 * ((GameController.updateMouseXPosition(mouseEvent) - 21) / 21));
            diceRollTransition.setDuration(Duration.millis(150));
            diceRollTransition.play();
        });
        TranslateTransition dicetransition = new TranslateTransition();
        dicetransition.setNode(dice);
        dicetransition.setFromX(95 * directonMult);
        dicetransition.setToX((95 + 50*index)*directonMult);
        dicetransition.setDuration(Duration.millis(1500-150*index));
        dicetransition.setOnFinished(actionEvent -> {
            dice.setHidden(hidden);
            dice.refreshValue();
        });
        dicetransition.play();
        return dice;
    }

    public static ImageView rollEnemyCoin(int directionmult, int index) {
        ImageView v = new ImageView(ResourceManager.getInstance().getToken());
        v.setTranslateY(-187);
        v.setTranslateX((72 + index * 20)*directionmult);
        v.setScaleX(0.6);
        v.setScaleY(0.6);
        v.setOnMouseEntered(mouseEvent -> {
            RotateTransition coinRollTransition = new RotateTransition();
            coinRollTransition.setNode(v);
            coinRollTransition.setToAngle(0);
            coinRollTransition.setFromAngle(-15 * ((GameController.updateMouseXPosition(mouseEvent) - 30) / 30));
            coinRollTransition.setDuration(Duration.millis(150));
            coinRollTransition.play();
        });

        TranslateTransition tr = new TranslateTransition();
        tr.setFromX(72 * directionmult);
        tr.setToX((72 + index * 10)*directionmult);
        tr.setDuration(Duration.millis(300 + 100 * index));
        tr.setNode(v);
        tr.play();

        return v;
    }
}
