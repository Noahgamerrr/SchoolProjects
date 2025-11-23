package team.wuerfelpoker.team1_wuerfelpoker;

import javafx.animation.*;
import javafx.css.converter.ColorConverter;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.effect.ColorAdjust;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.paint.Paint;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Font;
import javafx.util.Duration;
import team.wuerfelpoker.team1_wuerfelpoker.app.*;
import team.wuerfelpoker.team1_wuerfelpoker.dal.Statistic;
import team.wuerfelpoker.team1_wuerfelpoker.music.Music;
import team.wuerfelpoker.team1_wuerfelpoker.util.*;

import java.net.URL;
import java.util.*;

public class GameController implements Initializable {

    private enum GameState {
        MENUE,
        RUNNING,
        LOAD
    }
    ImageView background = new ImageView(ResourceManager.getImage("guiBackground.png"));
    @FXML
    private StackPane sp_main;
    private ImageView iv_continue = new ImageView();

    private int enemydicedeletionstat = 0;

    Random random = new Random();

    private String[] tracks = new String[3];
    LinkedList<Integer> savedDices = new LinkedList<>();

    private CardView deckCards0;
    private CardView deckCards1;
    private CardView deckCards2;

    private ImageView iv_refresh = new ImageView();
    private Label lb_currentPattern = new Label();
    // private Label lb_enemypattern1 = new Label();
    // private Label lb_enemypattern2 = new Label();

    private ImageView bar = new ImageView(ResourceManager.getImage("combinationbar.png"));
    private TranslateTransition barTransition = new TranslateTransition();
    private FadeTransition barFade = new FadeTransition();

    private TranslateTransition patternTransition = new TranslateTransition();
    private FadeTransition patternFade = new FadeTransition();


    private final List<Node> menuItems = new LinkedList<>();

    private final ImageView titleBackground = new ImageView(ResourceManager.getImage("titleBackground.png"));
    private final ImageView playButton = new ImageView(ResourceManager.getImage("titlePlay.png"));

    IntegerImageView buybtn1 = new IntegerImageView(ResourceManager.getInstance().getBuycard(), 0);

    IntegerImageView buybtn2 = new IntegerImageView(ResourceManager.getInstance().getBuycard(), 1);

    private boolean buttonActive = false;

    private boolean standardGame = false;

    ImageView buttonGlow = new ImageView(ResourceManager.getImage("buttonGlow.png"));

    private GameState state = GameState.MENUE;

    private List<Rectangle> rects = new LinkedList<>();


    int selectedamnt = 0;
    int maxselected = 3;

    // TODO: MODIFY TOKEN VALUES AS ROUNDS PROGRESS
    // TODO: ADD ROUND PROGRESSION SYSTEM VIA PLACEHOLDER BUTTON
    int tokens = 7;
    int opp1token = 7;
    int opp2token = 7;
    int tokenpot = 0;

    double playerValue = 0;
    double opp1Value = 0;
    double opp2Value = 0;
    LinkedList<ImageView> tokenpottokens = new LinkedList<>();
    int tokenpotheight = 0;

    int roundnumber = 1;
    FadeTransition roundTransition = new FadeTransition();
    int stage = 1;
    int intensity = 1;

    private LinkedList<DiceView> playerdices = new LinkedList<>();

    private LinkedList<DiceView> opponement1dices = new LinkedList<>();
    private LinkedList<DiceView> opponement2dices = new LinkedList<>();

    private LinkedList<DiceView> deleteBin = new LinkedList<>();

    private LinkedList<ImageView> enemyTokenBin = new LinkedList<>();
    private LinkedList<ImageView> playerTokenBin = new LinkedList<>();

    private LinkedList<CardView> cards = new LinkedList<>();

    private LinkedList<CardView> cardsTempl = new LinkedList<>();
    private Label lb_round = new Label();

    DeckSelectionRadio decks = new DeckSelectionRadio();

    /**
     * Evaluate who wins after a round end.
     */
    public void evaluateRoundResult() {
        int dir = 0;

        boolean opp1won = false;
        boolean opp2won = false;

        /**
         * Second setting of values to ensure everything is fair
         */
        opp1Value = evalutateDiceCombs(opponement1dices, null);
        opp2Value = evalutateDiceCombs(opponement2dices, null);

        if (playerValue >= opp1Value && playerValue >= opp2Value) {
            tokens += tokenpot;
            dir = 1;
        }
        else if (opp1Value > opp2Value) {
            opp1won = true;
            opp1token += tokenpot;
            dir = -1;
        } else {
            opp2token += tokenpot;
            opp2won = true;
            dir = -1;
        }

        for (DiceView d : opponement1dices) {
            d.setHidden(false);
            d.setSelected(opp1won);
            d.refreshValue();
        }

        for (DiceView d : opponement2dices) {
            d.setHidden(false);
            d.setSelected(opp2won);
            d.refreshValue();
        }

        for (ImageView i : tokenpottokens) {
            TranslateTransition transit = new TranslateTransition();
            transit.setNode(i);
            transit.setFromY(i.getTranslateY());
            transit.setToY(500*dir);
            transit.setDuration(Duration.seconds(1));
            transit.play();
        }

        tokenpot = 0;
    }


    /***
     * Visually renders the token pot
     */
    public void renderPot() {
        sp_main.getChildren().removeAll(tokenpottokens);
        tokenpottokens.clear();
        tokenpotheight = 0;

        if (tokens > 0) {
            tokens--;
            tokenpot++;
            addPotToken(0, 0);
        } else {
            lossEffect();
        }

        if (opp1token > 0) {
            opp1token--;
            tokenpot++;
            addPotToken(3, 0);
        } else opp1token = -1;

        if (opp2token > 0) {
            opp2token--;
            tokenpot++;
            addPotToken(5, 0);
        } else opp2token = -1;


        if (opp1token == -1 || opp2token == -1) {
            if (opp2token == -1 && opp1token == -1) {
                winEffect();
            } else if (!standardGame) {
                if (tokens > opp2token && tokens > opp1token)
                    winEffect();
                else
                    lossEffect();
            }
        }


    }

    /***
     * Adds one token to the pot. Visual only
     * @param index Horizontal Position (not in pixel)
     * @param height Vertical Position (not in pixel)
     */
    public void addPotToken(int index, int height) {
        ImageView v2 = new ImageView(ResourceManager.getInstance().getToken());
        v2.setTranslateX(-40 + 20 * index);
        v2.setTranslateY(20 * height);

        v2.setOnMouseEntered(mouseEvent -> {
            RotateTransition coinRollTransition = new RotateTransition();
            coinRollTransition.setNode(v2);
            coinRollTransition.setToAngle(0);
            coinRollTransition.setFromAngle(-9 * ((updateMouseXPosition(mouseEvent) - 30) / 30));
            coinRollTransition.setDuration(Duration.millis(150));
            coinRollTransition.play();
        });

        TranslateTransition tr = new TranslateTransition();
        tr.setFromY(-500);
        tr.setToY(v2.getTranslateY());
        tr.setDuration(Duration.millis(1500));
        tr.setNode(v2);
        tr.play();
        tokenpottokens.add(v2);
        sp_main.getChildren().add(v2);
    }

    /***
     * Tries to increase the intensity
     */
    public void intensityCycle() {
        if (stage < 3 && standardGame) {
            stage++;

            sp_main.getChildren().removeAll(cards);
            cards.clear();
            buybtn2.setDisable(false);
            buybtn1.setDisable(false);
            if (decks.getValue() != 3)
                insertCard(0, deckCards1);
            else
                insertCard(0);
            switch (stage) {
                case 2 -> {
                    lb_round.setTextFill(Color.YELLOW);
                    Music.getInstance().hardStartInf(tracks[1]);
                    for (int x = 0; x < 8; x++)
                        ParticleManager.createEverlivingEmber(sp_main);
                }
                case 3 -> {
                    lb_round.setTextFill(Color.RED);
                    Music.getInstance().hardStartInf(tracks[2]);
                    if (decks.getValue() != 3)
                        insertCard(1, deckCards2);
                    else
                        insertCard(1);
                    for (int x = 0; x < 12; x++)
                        ParticleManager.createEverlivingEmber(sp_main);
                }
            }

            ParticleManager.spawnSwoopParticles(sp_main, 80);
        }
        intensity = 0;
    }

    private void winEffect() {
        iv_continue.setVisible(false);
        iv_continue.setOnMouseClicked(null);
        Music.getInstance().hardStart("not_deepwoken_sfx.mp3");
        ImageView iv_win = new ImageView(ResourceManager.getImage("win.png"));

        StackPane.setAlignment(iv_win, Pos.CENTER);
        sp_main.getChildren().add(iv_win);
        iv_win.setScaleX(2);
        iv_win.setScaleY(2);
        FadeTransition fade = new FadeTransition();
        fade.setNode(iv_win);
        fade.setFromValue(0);
        fade.setToValue(1);
        fade.setDuration(Duration.seconds(1));
        fade.play();


    }
    private void lossEffect() {
        iv_continue.setVisible(false);
        iv_continue.setOnMouseClicked(null);
        Music.getInstance().hardStart("vine_boom.mp3");
        ImageView iv_win = new ImageView(ResourceManager.getImage("loss.png"));

        StackPane.setAlignment(iv_win, Pos.CENTER);
        sp_main.getChildren().add(iv_win);
        iv_win.setScaleX(2);
        iv_win.setScaleY(2);
        FadeTransition fade = new FadeTransition();
        fade.setNode(iv_win);
        fade.setFromValue(0);
        fade.setToValue(1);
        fade.setDuration(Duration.seconds(1));
        fade.play();


    }

    /***
     * Logic that plays whenever a round ends. Keep in mind that this can be executed
     * at most once every 2000 ms.
     */
    public void roundCycle() {

        roundnumber++;

        evaluateRoundResult();
        iv_continue.setVisible(false);
        intensity += 21;
        Threaded.delay(3000, () -> {
            if (intensity > 100)
                intensityCycle();
            deleteBin.addAll(opponement1dices);
            deleteBin.addAll(opponement2dices);
            deleteBin.addAll(playerdices);
            opponement1dices.clear();
            opponement2dices.clear();
            playerdices.clear();
            roundTransition.play();
            for (DiceView d : deleteBin) {
                FadeTransition fadeTrans = new FadeTransition();
                fadeTrans.setNode(d);
                fadeTrans.setDuration(Duration.millis(1200));
                fadeTrans.setFromValue(1);
                fadeTrans.setToValue(0);
                fadeTrans.play();
            }
            Threaded.delay(1400, () -> {
                sp_main.getChildren().removeAll(deleteBin);
                selectedamnt = 0;
                deleteBin.clear();
            });

            roundStart();
        });

        /**
         Dices are cleared here specifically. They are put into a bin where
         they are removed from the stack pane 1400ms after. This provides a
         more pleasing visual experience.
         */

    }


    /***
     *  Round start function, rerolls all dices and evaluates their values.
     */
    private void roundStart() {
        maxselected = 3;
        lb_round.setText(""+roundnumber);
        Threaded.delay(2000, () -> {iv_continue.setVisible(true);});

        renderPot();
        renderEnemyTokens();
        renderPlayerTokens();
        rollOpponementDices();
        rollDices();
        for (int x = 0; x < playerValue * 8; x++) {
            ParticleManager.createGlowParticle(sp_main, -80, 140 - random.nextInt(50));
        }

        if (intensity == 0)
            saveGameState();
    }

    private void loadRoundStart() {
        maxselected = 3;
        lb_round.setText(""+roundnumber);
        Threaded.delay(2000, () -> {iv_continue.setVisible(true);});

        renderPot();
        renderEnemyTokens();
        renderPlayerTokens();
    }

    /***
     * Renders both of the enemy tokens
     */
    private void renderEnemyTokens() {
        sp_main.getChildren().removeAll(enemyTokenBin);
        enemyTokenBin.clear();
        for (int i = 0; i < opp1token; i++) {
            ImageView v = EnemyManager.rollEnemyCoin(-1, i);
            enemyTokenBin.add(v);
            sp_main.getChildren().add(v);
        }

        for (int i = 0; i < opp2token; i++) {
            ImageView v = EnemyManager.rollEnemyCoin(1, i);
            enemyTokenBin.add(v);
            sp_main.getChildren().add(v);
        }
    }


    /***
     * Renders the available player tokens.
     */
    private void renderPlayerTokens() {
        sp_main.getChildren().removeAll(playerTokenBin);
        playerTokenBin.clear();

        for (int i = 0; i < tokens; i++) {
            ImageView v = new ImageView(ResourceManager.getInstance().getToken());
            v.setTranslateY(125);
            v.setTranslateX(85 - i * 20);

            v.setOnMouseEntered(mouseEvent -> {
                RotateTransition coinRollTransition = new RotateTransition();
                coinRollTransition.setNode(v);
                coinRollTransition.setToAngle(0);
                coinRollTransition.setFromAngle(-15 * ((updateMouseXPosition(mouseEvent) - 30) / 30));
                coinRollTransition.setDuration(Duration.millis(150));
                coinRollTransition.play();
            });

            TranslateTransition tr = new TranslateTransition();
            tr.setFromX(85);
            tr.setToX(85 - i * 20);
            tr.setDuration(Duration.millis(300 + 100 * i));
            tr.setNode(v);
            tr.play();
            playerTokenBin.add(v);
            sp_main.getChildren().add(v);
        }

    }



    private void appendBurnable(LinkedList<DiceView> deleteFrom,DiceView d) {
        d.setOnMouseClicked(mouseEvent -> {
            System.out.println("Clicked -> "+enemydicedeletionstat);
            if (enemydicedeletionstat > 0 && d.getValue() > 0) {
                enemydicedeletionstat--;
                d.setValue(0);
                FadeTransition burntrans = new FadeTransition();
                burntrans.setNode(d);
                burntrans.setFromValue(1);
                burntrans.setToValue(0);
                burntrans.setOnFinished(actionEvent -> {
                    deleteFrom.remove(d);
                    sp_main.getChildren().remove(d);
                });

                for (int x = 0; x < 20; x++) {
                    ParticleManager.createFireParticle(sp_main, d.getTranslateX(), d.getTranslateY());
                }

                burntrans.play();
            }
        });
    }

    /***
        Rolls new enemy dices, also evaluates their dice combinations.
        DOES NOT CLEAR OLD DICES
    ***/
    private void rollOpponementDices() {

        /*sp_main.getChildren().removeAll(opponement1dices);
        sp_main.getChildren().removeAll(opponement2dices);
        opponement1dices.clear();
        opponement2dices.clear();*/
        for (int x = 0; x < 5; x++) {
            if (opp1token >= 0)
                appendBurnable(opponement1dices, EnemyManager.rollEnemyDices(opponement1dices, -1, sp_main, x, x>2, random.nextInt(6)+1));

            if (opp2token >= 0)
                appendBurnable(opponement2dices, EnemyManager.rollEnemyDices(opponement2dices, 1, sp_main, x, x>2, random.nextInt(6)+1));

        }
        if (stage == 3) {
            if (opp1token >= 0)
                appendBurnable(opponement1dices, EnemyManager.rollEnemyDices(opponement1dices, -1, sp_main, 5, true, random.nextInt(6)+1));
            if (opp2token >= 0)
                appendBurnable(opponement2dices, EnemyManager.rollEnemyDices(opponement2dices, 1, sp_main, 5, true, random.nextInt(6)+1));
        }
        opp1Value = evalutateDiceCombs(opponement1dices, null);
        opp2Value = evalutateDiceCombs(opponement2dices, null);

        opp1Value = rerollForBetter(opponement1dices, opp1Value);
        opp2Value = rerollForBetter(opponement2dices, opp2Value);

        if (stage == 2) {
            opp1Value = rerollForBetter(opponement1dices, opp1Value);
            opp2Value = rerollForBetter(opponement2dices, opp2Value);
        }

        //System.out.println(DieCalculations.getData(opponement1dices.stream().map(DiceView::getValue).toList()));
    }

    /***
     * Rerolls a given linked list of dices. Attempting to get a better value.
     */
    private double rerollForBetter(LinkedList<DiceView> dice, double startvalue) {
        LinkedList<Integer> newView = new LinkedList<>();
        double value = 0;
        for (DiceView d : dice) {
            if (d.isHidden()) {
                newView.add(random.nextInt(6)+1);
            } else {
                newView.add(d.getValue());
            }
        }
        if (dice.size() > 1) {
            value = DieCalculations.getValue(newView);
        }


        if (value > startvalue) {
            //System.out.println("Old: "+startvalue+" -> New: "+value);
            startvalue = value;
            for (DiceView d : dice)
                d.setValue(newView.get(dice.indexOf(d)));
        }

        return startvalue;
    }

    /***
     * Spawns a singular player dice with a given index
     * @param index
     */
    private void spawnPlayerDice(int index, int value) {
        DiceView dice = new DiceView(1, true, value);
        playerdices.add(dice);
        sp_main.getChildren().add(dice);
        dice.setTranslateX(-425+76*index);
        dice.setTranslateY(217);
        dice.setOnMouseClicked(mouseEvent -> {
            clickDice(dice);
        });
        dice.setOnMouseEntered(mouseEvent -> {
            RotateTransition diceRollTransition = new RotateTransition();
            diceRollTransition.setNode(dice);
            diceRollTransition.setToAngle(0);
            diceRollTransition.setFromAngle(-10 * ((updateMouseXPosition(mouseEvent) - 30) / 30));
            diceRollTransition.setDuration(Duration.millis(150));
            diceRollTransition.play();
        });
        TranslateTransition dicetransition = new TranslateTransition();
        dicetransition.setNode(dice);
        dicetransition.setFromX(-425);
        dicetransition.setToX(-425+76*index);
        dicetransition.setDuration(Duration.millis(1500-150*index));
        dicetransition.setOnFinished(actionEvent -> {
            dice.setHidden(false);
            dice.refreshValue();
        });
        dicetransition.play();
    }


    /***
     * Rerolls all player dices,
     * NOTE: Does not clear the previous dices by default.
     */
    private void rollDices() {
        /*sp_main.getChildren().removeAll(playerdices);
        playerdices.clear();*/
        for (int x = 0; x < 5; x++) {
            spawnPlayerDice(x, random.nextInt(6)+1);
        }

        playerValue = evalutateDiceCombs(playerdices, lb_currentPattern);
    }

    /***
     * Gets the relative mouse position from the given object the event is executed from.
     * @param e
     * @return
     */
    public static double updateMouseXPosition(MouseEvent e) {
        return e.getX();
    }

    /***
     * Small function to individually animate and reroll selected dices.
     */
    private void rerollRelevantDices() {
        selectedamnt = 0;
        maxselected = 0;
        iv_refresh.setImage(ResourceManager.getInstance().getReroll());
        for(DiceView d : playerdices) {
            if (d.isSelected())
                rerollDice(d);
        }
        double oldval = playerValue;
        playerValue = evalutateDiceCombs(playerdices, lb_currentPattern);

        if (playerValue < oldval)
            Music.getInstanceSFX().hardStart("vine_boom.mp3");
        else if (playerValue > 5)
            Music.getInstanceSFX().hardStart("not_deepwoken_sfx.mp3");
        else
            Music.getInstanceSFX().hardStart("pickupCoin.mp3");

        for (int x = 0; x < playerValue * 8; x++) {
            ParticleManager.createGlowParticle(sp_main, -80, 140 - random.nextInt(50));
        }
    }

    /***
     * Reroll a single dice view, moving it away and back.
     * @param dice
     */
    private void rerollDice(DiceView dice) {
        rerollDice(dice, random.nextInt(6)+1);
    }

    private void rerollDice(DiceView dice, int val) {
        double oldpos = dice.getTranslateY();
        TranslateTransition rerollTransition = new TranslateTransition();
        rerollTransition.setNode(dice);
        rerollTransition.setFromY(oldpos);
        rerollTransition.setToY(dice.getTranslateY()*1.5);
        rerollTransition.setDuration(Duration.millis(200));
        dice.setValue(val);
        rerollTransition.setOnFinished(actionEvent -> {
            dice.setSelected(false);
            dice.refreshValue();
            rerollTransition.setOnFinished(null);
            rerollTransition.setFromY(dice.getTranslateY());
            rerollTransition.setToY(oldpos);
            rerollTransition.setDuration(Duration.millis(200));
            rerollTransition.play();
        });
        rerollTransition.play();
    }

    private void insertCard(int index) {
        CardView card = cardsTempl.get(random.nextInt(cardsTempl.size())).cloneCard();
        insertCard(index, card);
    }
    private void insertCard(int index, CardView c) {
        CardView card = c.cloneCard();
        card.setTranslateY(166);
        card.setTranslateX(245 + index * 155);
        card.setIndex(index);
        sp_main.getChildren().add(card);
        if (index == 0)
            buybtn1.setDisable(true);
        else
            buybtn2.setDisable(true);
        card.setMoving(true);
        cards.add(card);

        TranslateTransition intrans = new TranslateTransition();
        intrans.setNode(card);
        intrans.setFromY(800);
        intrans.setToY(166);
        intrans.setDuration(Duration.seconds(1.5));
        intrans.setOnFinished(actionEvent -> {
            card.setMoving(false);
        });
        intrans.play();


        card.setOnMouseClicked(mouseEvent -> {
            Music.getInstanceSFX().hardStart("paperflip.mp3");
            if (index == 0)
                buybtn1.setDisable(false);
            else
                buybtn2.setDisable(false);
            card.runCard();
            cards.remove(card);
        });

        card.setOnMouseEntered(mouseEvent -> {
            if (!card.isMoving()) {
                Music.getInstanceSFX().hardStart("papertouch.mp3");
                TranslateTransition trans = new TranslateTransition();
                trans.setNode(card);
                trans.setFromY(166);
                trans.setToY(150);
                trans.setDuration(Duration.millis(100));
                trans.play();
            }

        });

        card.setOnMouseExited(mouseEvent -> {
            if (!card.isMoving()) {
                TranslateTransition trans = new TranslateTransition();
                trans.setNode(card);
                trans.setFromY(150);
                trans.setToY(166);
                trans.setDuration(Duration.millis(100));
                trans.play();
            }
        });


    }


    /***
     * Select a die when it is clicked
     * @param d
     */
    private void clickDice(DiceView d) {
        if (selectedamnt < maxselected || d.isSelected()) {
            d.setSelected(!d.isSelected());
            if (d.isSelected()) {
                selectedamnt++;
            } else {
                selectedamnt--;
            }

            d.refreshValue();

            if (selectedamnt > 0)
                iv_refresh.setImage(ResourceManager.getInstance().getRerollselected());
            else
                iv_refresh.setImage(ResourceManager.getInstance().getReroll());
        }
    }

    /***
     * Generic asset setup function that loads all of the visual elements.
     */
    private void setupAssets() {

        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), lb_currentPattern);
        StackPane.setAlignment(lb_currentPattern, Pos.CENTER_LEFT);
        StackPane.setAlignment(bar, Pos.CENTER_LEFT);

        /*
        sp_main.getChildren().add(lb_enemypattern1);
        StackPane.setAlignment(lb_enemypattern1, Pos.CENTER_LEFT);
        lb_enemypattern1.setTranslateY(-65);

        sp_main.getChildren().add(lb_enemypattern2);
        StackPane.setAlignment(lb_enemypattern2, Pos.CENTER_RIGHT);
        lb_enemypattern2.setTranslateY(-65);
        */

        iv_refresh.setImage(ResourceManager.getInstance().getReroll());
        iv_refresh.setTranslateX(130);
        iv_refresh.setTranslateY(165);
        iv_refresh.setOnMouseClicked(mouseEvent -> {
            if (selectedamnt > 0)
                rerollRelevantDices();
        });
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), iv_refresh);

        iv_continue.setImage(ResourceManager.getInstance().getRoundskipImage());
        iv_continue.setOnMouseClicked(mouseEvent -> {
            roundCycle();
        });

        lb_round.setTextFill(Color.WHITE);
        lb_round.setFont(new Font("Droid Sans Mono Dotted", 80));
        lb_round.setTranslateY(10);
        StackPane.setAlignment(lb_round, Pos.TOP_CENTER);
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), lb_round);

        roundTransition.setNode(lb_round);
        roundTransition.setDuration(Duration.millis(200));
        roundTransition.setFromValue(0);
        roundTransition.setToValue(1);

        lb_currentPattern.setTextFill(Color.WHITE);
        lb_currentPattern.setFont(new Font("Droid Sans Mono Dotted", 30));
        lb_currentPattern.setTranslateY(100);
        lb_currentPattern.setTranslateX(40);

        bar.setTranslateY(120);
        bar.setTranslateX(-400);
        bar.setScaleX(2.8);


        patternTransition.setNode(lb_currentPattern);
        patternTransition.setFromX(-200);
        patternTransition.setToX(20);
        patternTransition.setDuration(Duration.seconds(1));

        patternFade.setNode(lb_currentPattern);
        patternFade.setFromValue(0);
        patternFade.setToValue(1);
        patternFade.setDuration(Duration.seconds(1));

        barTransition.setNode(bar);
        barTransition.setFromX(-400);
        barTransition.setToX(0);
        barTransition.setDuration(Duration.seconds(1));

        barFade.setNode(bar);
        barFade.setFromValue(0);
        barFade.setToValue(1);
        barFade.setDuration(Duration.seconds(1));
        StackPane.setAlignment(iv_continue, Pos.TOP_CENTER);
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), iv_continue);
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), bar);

        //card.setTranslateX(245 + index * 155);

        if (standardGame) {
            setupBuyBtn(buybtn1);
            setupBuyBtn(buybtn2);
        }


    }

    private void setupBuyBtn(IntegerImageView btn) {
        btn.setTranslateX(245 + btn.getIndex() * 155);
        btn.setTranslateY(166);

        btn.setOnMouseClicked(mouseEvent -> {
            System.out.println(btn.isDisable());
            if (tokens > 1 && !btn.isDisable()) {
                Music.getInstanceSFX().hardStart("coinfx.mp3");
                tokens--;
                removeLastFromBin(playerTokenBin);
                if (stage != 3) {
                    tokens--;
                    Threaded.delay(200, () -> {removeLastFromBin(playerTokenBin);});
                }

                insertCard(btn.getIndex());
            }
        });
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), btn);
    }

    public void removeLastFromBin(LinkedList<ImageView> vw) {
        ImageView token = vw.getLast();
        vw.remove(token);

        TranslateTransition dissapear = new TranslateTransition();
        dissapear.setFromY(token.getTranslateY());
        dissapear.setToY(400);
        dissapear.setNode(token);
        dissapear.setDuration(Duration.seconds(1));
        dissapear.setOnFinished(actionEvent -> {
            sp_main.getChildren().remove(token);
        });
        dissapear.play();
    }

    /***
     * Evaluates the dice combinations of a given dice view and prints the combination into a label.
     * @param dices
     * @param lb
     */
    private double evalutateDiceCombs(LinkedList<DiceView> dices, Label lb) {
        if (dices.size() > 1) {
            DieCalculations.DieRecord record = DieCalculations.getData(dices.stream().map(DiceView::getValue).toList());
            if (lb == lb_currentPattern) {



                patternFade.play();
                patternTransition.play();
                barFade.play();
                barTransition.play();
                lb.setText(record.name());
                bar.setScaleX(lb.getText().length() * 0.15 + 0.4);

                int auxileryval = 239 - (int)(record.value() * 31) + 16;
                int auxileryval3 = 239 - (int)(record.value() * 31) / 3 + 16;


                Color col = (Color) Paint.valueOf("ff"+Integer.toHexString(auxileryval)+Integer.toHexString(auxileryval3));


                lb.setTextFill(col);
            }
            return record.value();
        } else {
            return 0;
        }
    }

    /**
     * Shows the options-tab
     */
    private void showOptions() {
        StackPane optionsPane = new StackPane();
        menuItems.add(optionsPane);
        sp_main.getChildren().add(optionsPane);
        ImageView optionsBackground = new ImageView(ResourceManager.getImage("backgroundSettings.png"));
        optionsPane.getChildren().add(optionsBackground);
        ImageView titleGameMode = new ImageView(ResourceManager.getImage("titleOptions.png"));
        titleGameMode.setTranslateY(-125);
        optionsPane.getChildren().add(titleGameMode);
        ImageView titleGamemode = new ImageView(ResourceManager.getImage("titleGamemode.png"));
        titleGamemode.setTranslateX(-185);
        titleGamemode.setTranslateY(-65);
        optionsPane.getChildren().add(titleGamemode);
        ImageView gamemodeStandard = new ImageView(ResourceManager.getImage("gamemodeStandard.png"));
        gamemodeStandard.setTranslateX(-150);
        gamemodeStandard.setTranslateY(-25);
        optionsPane.getChildren().add(gamemodeStandard);
        ImageView gamemodeLegacy = new ImageView(ResourceManager.getImage("gamemodeLegacy.png"));
        gamemodeLegacy.setTranslateX(200);
        gamemodeLegacy.setTranslateY(-25);
        optionsPane.getChildren().add(gamemodeLegacy);
        ImageView titleDeck = new ImageView(ResourceManager.getImage("titleDeck.png"));
        titleDeck.setTranslateX(-242);
        titleDeck.setTranslateY(10);
        optionsPane.getChildren().add(titleDeck);
        sp_main.getChildren().remove(buttonGlow);
        optionsPane.getChildren().add(buttonGlow);
        buttonGlow.setTranslateY(130);
        CheckBoxRadio boxes = new CheckBoxRadio();
        CheckBoxView standard = new CheckBoxView(true);
        CheckBoxView legacy = new CheckBoxView();
        standard.setTranslateY(-25);
        standard.setTranslateX(-230);
        legacy.setTranslateY(-25);
        legacy.setTranslateX(135);
        boxes.addAll(standard, legacy);
        optionsPane.getChildren().addAll(standard, legacy);

        DeckSelectionView deckOne = new DeckSelectionView(1, true);
        deckOne.setTranslateX(-150);
        deckOne.setTranslateY(25);
        DeckSelectionView deckTwo = new DeckSelectionView(2);
        deckTwo.setTranslateX(-150 + 70);
        deckTwo.setTranslateY(45);
        DeckSelectionView deckThree = new DeckSelectionView(3);
        deckThree.setTranslateX(-150 + 70 * 2);
        deckThree.setTranslateY(45);
        DeckSelectionView deckFour = new DeckSelectionView(4);
        deckFour.setTranslateX(-150 + 70 * 3);
        deckFour.setTranslateY(45);
        optionsPane.getChildren().addAll(deckOne, deckTwo, deckThree, deckFour);
        decks.addAll(deckOne, deckTwo, deckThree, deckFour);
        decks.setValue(1);
        ImageView buttonPlay = new ImageView(ResourceManager.getImage("titlePlay.png"));
        buttonPlay.setTranslateY(130);
        buttonPlay.setOnMouseClicked(event -> {
            state = GameState.RUNNING;
            standardGame = standard.isChecked();
            screenTransition();
        });
        buttonPlay.setOnMouseEntered(event -> {
            buttonPlay.setImage(ResourceManager.getImage("titlePlay_hover.png"));
            showButtonGlow();
        });
        buttonPlay.setOnMouseExited(event -> {
            buttonPlay.setImage(ResourceManager.getImage("titlePlay.png"));
            hideButtonGlow();
        });
        optionsPane.getChildren().add(buttonPlay);
        optionsPane.setTranslateY(500);
        TranslateTransition moveOptions = new TranslateTransition();
        moveOptions.setNode(optionsPane);
        moveOptions.setToY(0);
        moveOptions.setDuration(Duration.millis(500));
        moveOptions.play();
    }

    /**
     * Generates the rectangles
     */
    private List<Rectangle> getRects() {
        List<Rectangle> rects = new LinkedList<>();
        for (int i = 1; i <= 11; i++) {
            Rectangle rect = new Rectangle(960, 54);
            rect.setTranslateY(-270 + 53 * (i - 1));
            rects.add(rect);
        }
        return rects;
    }

    /**
     * Fading animation of the rectangles during screen changes
     */
    private void fadeRectAnimation() {
        if (rects.size() == 0) {
            rects = getRects();
            sp_main.getChildren().addAll(rects);
        }
        ParallelTransition all = new ParallelTransition();
        SequentialTransition seq = new SequentialTransition();
        for (int i = 0; i <= 5; i++) {
            ParallelTransition par = new ParallelTransition();
            FadeTransition transTop = new FadeTransition();
            Node topRect = rects.get(5 - i);
            transTop.setNode(topRect);
            transTop.setDuration(Duration.millis(50));
            transTop.setToValue(0);
            FadeTransition transBottom = new FadeTransition();
            Node bottomRect = rects.get(5 + i);
            transBottom.setNode(bottomRect);
            transBottom.setDuration(Duration.millis(50));
            transBottom.setToValue(0);
            par.getChildren().addAll(transTop, transBottom);
            par.setOnFinished(event -> sp_main.getChildren().removeAll(topRect, bottomRect));
            seq.getChildren().add(par);
        }
        all.getChildren().add(seq);
        for (int i = 0; i < 2; i++) {
            FadeTransition mainFade = new FadeTransition();
            mainFade.setNode(menuItems.get(i));
            mainFade.setToValue(1);
            mainFade.setDuration(Duration.millis(600));
            all.getChildren().add(mainFade);
        }
        all.setDelay(Duration.millis(250));
        all.play();
    }

    /**
     * Animates the title screen
     */
    private void screenTransition() {
        rects = getRects();
        Music.getInstanceSFX().hardStart("not_deepwoken_sfx.mp3");
        for (Rectangle r : rects) r.setOpacity(0);
        sp_main.getChildren().addAll(rects);
        SequentialTransition seq = new SequentialTransition();
        for (int i = 5; i >= 0; i--) {
            ParallelTransition par = new ParallelTransition();
            FadeTransition transTop = new FadeTransition();
            Node topRect = rects.get(5 - i);
            transTop.setNode(topRect);
            transTop.setDuration(Duration.millis(50));
            transTop.setToValue(1);
            FadeTransition transBottom = new FadeTransition();
            Node bottomRect = rects.get(5 + i);
            transBottom.setNode(bottomRect);
            transBottom.setDuration(Duration.millis(50));
            transBottom.setToValue(1);
            par.getChildren().addAll(transTop, transBottom);
            seq.getChildren().add(par);
        }
        seq.setDelay(Duration.millis(250));
        seq.setOnFinished(event -> {
            clearTitleScreen();
            changeScreen();
            fadeRectAnimation();
        });
        seq.play();
    }


    /**
     * Creates the title of the game with the die-image and returns it
     */
    private HBox createTitle() {
        HBox title = new HBox();
        ImageView titleName = new ImageView(ResourceManager.getImage("title.png"));
        ImageView titleDie = new ImageView(ResourceManager.getImage("titleDie.png"));
        titleDie.setTranslateY(-32);
        title.getChildren().addAll(titleName, titleDie);
        return title;
    }

    /**
     * Animates the button to fade into screen
     * @param button the button to be faded in
     * @param delay the delay of the animation
     */
    private void buttonFade(Node button, int delay, boolean activate) {
        FadeTransition fade = new FadeTransition();
        button.setOpacity(0);
        fade.setNode(button);
        fade.setDuration(Duration.seconds(1));
        fade.setToValue(1);
        fade.setDelay(Duration.seconds(delay));
        if (activate) fade.setOnFinished(event -> buttonActive = true);
        fade.play();
    }

    /**
     * Changes the screen
     */
    private void changeScreen() {
        switch (state) {
            case MENUE -> showTitleScreen();
            case RUNNING -> initGame();
            case LOAD -> initGameLoad();
        }
    }


    /**
     * Animates the glow of the button
     * @param val fade in or fade out
     */
    private void fadeGlow(int val) {
        FadeTransition glowTransition = new FadeTransition();
        glowTransition.setNode(buttonGlow);
        glowTransition.setToValue(val);
        glowTransition.setDuration(Duration.millis(200));
        glowTransition.setAutoReverse(true);
        glowTransition.play();
    }


    /**
     * Shows the glow of the button
     */
    private void showButtonGlow() {
        fadeGlow(1);
    }

    /**
     * Hides the glow of the button
     */
    private void hideButtonGlow() {
        fadeGlow(0);
    }

    /**
     * Initializes the title screen
     */
    private void initTitleScreen() {
        HBox title = createTitle();
        title.setAlignment(Pos.TOP_CENTER);
        title.setTranslateY(65);
        TranslateTransition translateTitle = new TranslateTransition();
        translateTitle.setNode(title);
        translateTitle.setByY(15);
        translateTitle.setDuration(Duration.seconds(1));
        translateTitle.setAutoReverse(true);
        translateTitle.setCycleCount(Timeline.INDEFINITE);
        translateTitle.play();
        buttonGlow.setTranslateY(-50);
        buttonGlow.setOpacity(0);
        playButton.setTranslateY(-50);
        playButton.setOnMouseClicked(event -> {
            if (buttonActive) showOptions();
        });
        playButton.setOnMouseEntered(event -> {
            if (buttonActive) {
                playButton.setImage(ResourceManager.getImage("titlePlay_hover.png"));
                showButtonGlow();
            }
        });
        playButton.setOnMouseExited(event -> {
            if (buttonActive) {
                playButton.setImage(ResourceManager.getImage("titlePlay.png"));
                hideButtonGlow();
            }
        });
        ImageView loadButton = new ImageView(ResourceManager.getImage("titleLoad.png"));
        loadButton.setOnMouseClicked(event -> {
            if (buttonActive) {
                state = GameState.LOAD;
                screenTransition();
            }
        });
        loadButton.setOnMouseEntered(event -> {
            if (buttonActive) loadButton.setImage(ResourceManager.getImage("titleLoad_hover.png"));
        });
        loadButton.setOnMouseExited(event -> {
            if (buttonActive) loadButton.setImage(ResourceManager.getImage("titleLoad.png"));
        });
        loadButton.setTranslateY(75);
        buttonFade(loadButton, 3, true);
        menuItems.addAll(List.of(titleBackground, title, buttonGlow, playButton, loadButton));
    }


    /**
     * Shows the title screen
     */
    private void showTitleScreen() {
        sp_main.getChildren().addAll(menuItems);
        buttonFade(playButton, 1, false);
    }


    /**
     * Clears the title screen
     */
    private void clearTitleScreen() {
        sp_main.getChildren().removeAll(menuItems);
    }


    /**
     * Initializes the game
     */
    private void initGame() {




        titleBackground.setImage(ResourceManager.getImage("blankbg.png"));
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), titleBackground);
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), background);
        // Resource Manager Setup
        ResourceManager.getInstance();

        setupAssets();
        cardSetup();
        System.out.println(decks.getValue());
        setupDeckValues();
        Threaded.delay(1000, this::roundStart);
        if (standardGame)
            Threaded.delay(600, () -> {
                if (decks.getValue() != 3)
                    insertCard(0, deckCards0);
                else
                    insertCard(0);
            });
        Music.getInstance().hardStartInf(tracks[0]);
    }

    private void saveGameState() {
        SaveManager m = new SaveManager();

        String[] arr = new String[2];
        int[] playerdicecopy = new int[7];
        int[] opp1dices = new int[7];
        int[] opp2dices = new int[7];

        for (int x = 0; x < 2; x++) {
            if (cards.size() > x)
                arr[x] = cards.get(x).getName();

            if (arr[x] == null)
                arr[x] = "";
        }

        for (int x = 0; x < 7; x++) {
            if (opponement1dices.size() > x)
                opp1dices[x] = opponement1dices.get(x).getValue();
            else
                opp1dices[x] = 0;

            if (opponement2dices.size() > x)
                opp2dices[x] = opponement2dices.get(x).getValue();
            else
                opp2dices[x] = 0;

            if (playerdices.size() > x)
                playerdicecopy[x] = playerdices.get(x).getValue();
            else
                playerdicecopy[x] = 0;

        }

        m.setCardsPlayer(arr);
        m.setDicesBot1(opp1dices);
        m.setDicesBot2(opp2dices);
        m.setDicesPlayer(playerdicecopy);
        m.setRound(roundnumber);
        m.setTokenBot1(opp1token);
        m.setTokenBot2(opp2token);
        m.setStandardGame(standardGame);
        m.setTokenStat(tokens);
        m.setCardDeck(decks.getValue());

        m.save();
    }

    private void setupDeckValues() {
        switch(decks.getValue()) {
            case 1 -> {
                tracks[0] = "binah1.mp3";
                tracks[1] = "binah2.mp3";
                tracks[2] = "binah3.mp3";

                CardView weightedroll = new CardView(ResourceManager.getImage("card_weightedroll.png"), this::cardWeightedReroll, sp_main, "weightedroll");

                deckCards0 = weightedroll;
                deckCards1 = weightedroll;
                deckCards2 = weightedroll;
                cardsTempl.add(weightedroll);
            }
            case 2 -> {
                tracks[0] = "hokma1.mp3";
                tracks[1] = "hokma2.mp3";
                tracks[2] = "hokma3.mp3";

                CardView timereturn = new CardView(ResourceManager.getImage("card_saveload.png"), this::determineCardLoad, sp_main, "saveload");
                deckCards0 = timereturn;
                deckCards1 = timereturn;
                deckCards2 = timereturn;

                cardsTempl.add(timereturn);
            }
            case 3 -> {
                tracks[0] = "kether1.mp3";
                tracks[1] = "kether2.mp3";
                tracks[2] = "kether3.mp3";
            }
            case 4 -> {
                tracks[0] = "abno1.mp3";
                tracks[1] = "abno2.mp3";
                tracks[2] = "abno3.mp3";

                CardView burn = new CardView(ResourceManager.getImage("card_burndice.png"), this::cardBurnDice, sp_main, "burndice");
                deckCards0 = burn;
                deckCards1 = burn;
                deckCards2 = burn;
                cardsTempl.add(burn);
            }
        }
    }



    private void initGameLoad() {


        titleBackground.setImage(ResourceManager.getImage("blankbg.png"));
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), titleBackground);
        sp_main.getChildren().add(sp_main.getChildren().size() - rects.size(), background);
        // Resource Manager Setup
        ResourceManager.getInstance();
        SaveManager manager = new SaveManager();

        cardSetup();
        Statistic stat = manager.load();
        standardGame = stat.isStandardGame();
        setupAssets();
        roundnumber = stat.getRound();
        stage = roundnumber / 5 + 1;
        if (stage > 3) stage = 3;


        tokens = stat.getTokenStat();
        opp2token = stat.getTokenBot2();
        opp1token = stat.getTokenBot1();

        Threaded.delay(500, () -> {





            decks.setValue(stat.getCardDeck());

            setupDeckValues();
            Music.getInstance().hardStartInf(tracks[stage-1]);
            for (int x = 0; x < stat.getDicesPlayer().length; x++) {

                if (stat.getDicesBot1()[x] > 0)
                    appendBurnable(opponement1dices, EnemyManager.rollEnemyDices(opponement1dices, -1, sp_main, x, x < 2, stat.getDicesBot1()[x]));
                if (stat.getDicesBot2()[x] > 0)
                    appendBurnable(opponement2dices, EnemyManager.rollEnemyDices(opponement2dices, 1, sp_main, x, x < 2, stat.getDicesBot2()[x]));
                if (stat.getDicesPlayer()[x] > 0)
                    spawnPlayerDice(x, stat.getDicesPlayer()[x]);
            }
            for (int x = 0; x < 2; x++) {
                System.out.println("Card on index: "+x+" is "+stat.getCardsPlayer()[x]);
                if (stat.getCardsPlayer()[x].length() > x) {
                    switch(stat.getCardsPlayer()[x]) {
                        case "adddice" -> {insertCard(x, cardsTempl.get(0).cloneCard());}
                        case "reroll" -> {insertCard(x, cardsTempl.get(1).cloneCard());}
                        case "upante" -> {insertCard(x, cardsTempl.get(2).cloneCard());}
                        case "weightedroll" -> {insertCard(x, new CardView(ResourceManager.getImage("card_weightedroll.png"), this::cardWeightedReroll, sp_main, "weightedroll"));}
                        case "burndice" -> {insertCard(x, new CardView(ResourceManager.getImage("card_burndice.png"), this::cardBurnDice, sp_main, "burndice"));}
                        case "saveload" -> {new CardView(ResourceManager.getImage("card_saveload.png"), this::determineCardLoad, sp_main, "saveload");}
                    }

                }
            }
        });



        Threaded.delay(1000, this::loadRoundStart);
    }

    private void cardSetup() {
        cardsTempl.add(new CardView(ResourceManager.getImage("card_adddice.png"), this::cardAddDice, sp_main, "adddice"));
        //cardsTempl.add(new CardView(ResourceManager.getImage("card_choosedice.png"), this::cardAddDice, sp_main));
        cardsTempl.add(new CardView(ResourceManager.getImage("card_reroll.png"), this::cardReroll, sp_main, "reroll"));
        //cardsTempl.add(new CardView(ResourceManager.getImage("card_swapdice.png"), this::cardAddDice, sp_main));
        cardsTempl.add(new CardView(ResourceManager.getImage("card_upante.png"), this::cardUpAnte, sp_main, "upante"));
    }

    private void cardAddDice() {
        System.out.println("Ran");
        if (playerdices.size() < 7) {
            spawnPlayerDice(playerdices.size(), random.nextInt(6)+1);
            playerValue = evalutateDiceCombs(playerdices, lb_currentPattern);
        }
    }

    private void cardUpAnte() {
        if (tokens > 0) {
            tokens--;
            tokenpot++;
            removeLastFromBin(playerTokenBin);
            tokenpotheight++;
            addPotToken(0,tokenpotheight);
            if (opp2token > 0) {
                opp2token--;
                tokenpot++;
                addPotToken(5,tokenpotheight);
            }
            if (opp1token > 0) {
                tokenpot++;
                opp1token--;
                addPotToken(3,tokenpotheight);
            }
            renderEnemyTokens();
        }
    }

    private void cardBurnDice() {
        enemydicedeletionstat = 2;
    }

    private void determineCardLoad() {
        if (savedDices.size() > 0)
            cardLoadCombination();
        else
            cardSaveCombination();
    }

    private void cardSaveCombination() {
        savedDices = new LinkedList<>();
        selectedamnt = 0;
        maxselected = 3;
        for (DiceView d : playerdices) {
            FadeTransition fadetrans = new FadeTransition();
            fadetrans.setNode(d);
            fadetrans.setFromValue(1);
            fadetrans.setToValue(0);
            fadetrans.setDuration(Duration.seconds(1.5));
            fadetrans.setOnFinished(actionEvent -> {
                sp_main.getChildren().remove(d);
            });
            savedDices.add(d.getValue());
            for (int x = 0; x < 10; x++) {
                ParticleManager.createFireParticle(sp_main, d.getTranslateX(), d.getTranslateY());
            }
            fadetrans.play();


        }
        if (cards.size() > 0)
            cards.remove(0);
        playerdices.clear();
        sp_main.getChildren().removeAll(playerdices);
        insertCard(0, cardsTempl.getLast());
        Threaded.delay(500, this::rollDices);
    }

    private void cardLoadCombination() {
        sp_main.getChildren().removeAll(playerdices);
        playerdices.clear();
        selectedamnt = 0;
        maxselected = 3;
        int index = 0;
        for (Integer i : savedDices) {
            spawnPlayerDice(index, i);
            index++;
        }

        playerValue = evalutateDiceCombs(playerdices, lb_currentPattern);
        savedDices.clear();
    }
    private void cardWeightedReroll() {
        LinkedList<Integer> topvals = new LinkedList<>();


        for (int y = 0; y < 9; y++) {
            for (DiceView d : playerdices)
                if (d.isSelected())
                    topvals.add(random.nextInt(6)+1);
                else
                    topvals.add(d.getValue());

            if (DieCalculations.getValue(topvals) > evalutateDiceCombs(playerdices, null))
                for (int x = 0; x < topvals.size(); x++)
                    playerdices.get(x).setValue(topvals.get(x));
            topvals.clear();
        }

        for (DiceView d : playerdices)
            if (d.isSelected()) {
                rerollDice(d, d.getValue());
                d.setSelected(false);
            }

        rerollRelevantDices();
    }

    public void cardReroll() {
        maxselected+=3;
    }


    /***
     * Function gets executed first.
     * @param url
     * @param resourceBundle
     */
    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {

        initTitleScreen();
        Threaded.delay(1000, () -> {
            showTitleScreen();
            fadeRectAnimation();
        });

    }



}