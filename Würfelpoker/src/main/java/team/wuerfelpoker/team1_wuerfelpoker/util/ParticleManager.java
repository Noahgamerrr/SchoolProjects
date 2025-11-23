package team.wuerfelpoker.team1_wuerfelpoker.util;

import javafx.animation.FadeTransition;
import javafx.animation.TranslateTransition;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Pos;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import javafx.util.Duration;
import team.wuerfelpoker.team1_wuerfelpoker.GameApplication;

import java.util.LinkedList;
import java.util.Random;

public class ParticleManager {

    private static LinkedList<ImageView> embers = new LinkedList<>();

    public static LinkedList<ImageView> getEmbers() {
        return embers;
    }

    static Random random = new Random();

    public static void spawnSwoopParticles(StackPane sp, int amount) {
        for (int i = 0; i < amount; i++)
            createSwoopFX(sp);
    }

    public static void createSwoopFX(StackPane sp) {

        ImageView particle = new ImageView(ResourceManager.getInstance().getParticle());
        int offset = random.nextInt(500) + 100;
        particle.setTranslateX(offset);
        StackPane.setAlignment(particle, Pos.CENTER_RIGHT);
        particle.setTranslateY(random.nextInt(GameApplication.screenHeight) - (float)GameApplication.screenHeight / 2);
        particle.setScaleX(9);
        particle.setScaleY(4);
        TranslateTransition trans = new TranslateTransition();
        trans.setNode(particle);
        trans.setDuration(Duration.seconds(1));
        trans.setFromX(offset);
        trans.setToX((GameApplication.screenWidth + offset) * -2);
        trans.setOnFinished(actionEvent -> {
            sp.getChildren().remove(particle);
        });
        trans.play();


        sp.getChildren().add(particle);
    }



    public static void createEverlivingEmber(StackPane sp) {
        ImageView particle = new ImageView(ResourceManager.getInstance().getEmber());
        int offset = random.nextInt(300) + 100;
        particle.setTranslateY(offset);
        StackPane.setAlignment(particle, Pos.BOTTOM_CENTER);
        particle.setTranslateX(random.nextInt(GameApplication.screenWidth * 2) - (float)GameApplication.screenWidth);
        particle.setScaleX(2);
        particle.setScaleY(4);
        TranslateTransition trans = new TranslateTransition();
        trans.setNode(particle);
        trans.setDuration(Duration.seconds(1 + random.nextFloat()));
        trans.setFromY(offset);
        trans.setToY((GameApplication.screenHeight + offset) * -2);
        trans.setOnFinished(actionEvent -> {
            trans.play();
        });
        trans.play();

        embers.add(particle);
        sp.getChildren().add(particle);
    }

    public static void createGlowParticle(StackPane sp, int x, int y) {

        ImageView particle = new ImageView(ResourceManager.getInstance().getGlowparticle());
        int offsetx = random.nextInt(300) + 300;
        int offsety = random.nextInt(200) - 100;
        float len = 1 + random.nextFloat();
        particle.setTranslateY(y);
        StackPane.setAlignment(particle, Pos.CENTER_LEFT);
        particle.setTranslateX(x);
        particle.setScaleX(0.7);
        particle.setScaleY(0.5);

        FadeTransition fadetrans = new FadeTransition();
        fadetrans.setNode(particle);
        fadetrans.setDuration(Duration.seconds(len));
        fadetrans.setFromValue(1);
        fadetrans.setToValue(0);

        TranslateTransition trans = new TranslateTransition();
        trans.setNode(particle);
        trans.setDuration(Duration.seconds(len));
        trans.setByX(offsetx);
        trans.setByY(offsety);
        trans.setOnFinished(actionEvent -> {
            sp.getChildren().remove(particle);
        });
        trans.play();
        fadetrans.play();

        sp.getChildren().add(particle);

    }

    public static void createFireParticle(StackPane sp, double x, double y) {

        ImageView particle = new ImageView(ResourceManager.getInstance().getFlameparticle());
        int offsetx = random.nextInt(40) - 20;
        int offsety = (random.nextInt(200) + 100) * -1;
        float len = 2 + random.nextFloat();
        particle.setTranslateY(y+random.nextInt(50)-25);
        particle.setTranslateX(x+random.nextInt(50)-25);
        particle.setScaleX(0.5);
        particle.setScaleY(0.5);

        FadeTransition fadetrans = new FadeTransition();
        fadetrans.setNode(particle);
        fadetrans.setDuration(Duration.seconds(len));
        fadetrans.setFromValue(1);
        fadetrans.setToValue(0);

        TranslateTransition trans = new TranslateTransition();
        trans.setNode(particle);
        trans.setDuration(Duration.seconds(len));
        trans.setByX(offsetx);
        trans.setByY(offsety);
        trans.setOnFinished(actionEvent -> {
            sp.getChildren().remove(particle);
        });
        trans.play();
        fadetrans.play();

        sp.getChildren().add(particle);

    }

}
