package team.wuerfelpoker.team1_wuerfelpoker.util;

import javafx.scene.image.Image;
import team.wuerfelpoker.team1_wuerfelpoker.GameApplication;

import java.util.Objects;

public class ResourceManager {



    private static ResourceManager instance = null;

    public static ResourceManager getInstance() {
        if (instance == null) {
            instance = new ResourceManager();
        }
        return instance;
    }

    public ResourceManager() {
        for (int x = 1; x < 7; x++) {
            diceImageArray[x-1] = getImage("dice"+x+".png");
            diceSelectedArray[x-1] = getImage("dice"+x+"_selected.png");
        }
        diceImageArray[6] = getImage("emptydice.png");

        System.out.println("Dice Resources Loaded");
    }

    public Image[] getDices() {
        return diceImageArray;
    }

    public Image[] getSelectedDices() {
        return diceSelectedArray;
    }

    private Image[] diceImageArray = new Image[7];
    private Image[] diceSelectedArray = new Image[7];

    private Image reroll = getImage("reroll.png");
    private Image rerollselected = getImage("reroll_selected.png");

    private Image roundskipImage = getImage("continuebutton.png");

    private Image token = getImage("token.png");

    private Image particle = getImage("particle.png");

    private Image ember = getImage("ember.png");

    private Image buycard = getImage("buycard.png");

    private Image glowparticle = getImage("glowparticleeffect.png");

    private Image flameparticle = getImage("flameparticle.png");

    public Image getFlameparticle() {
        return flameparticle;
    }

    public Image getRoundskipImage() {
        return roundskipImage;
    }

    public Image getParticle() {
        return particle;
    }

    public Image getReroll() {
        return reroll;
    }

    public Image getRerollselected() {
        return rerollselected;
    }

    public static Image getImage(String s) {
        return new Image(Objects.requireNonNull(GameApplication.class.getResourceAsStream(s)));
    }

    public Image getGlowparticle() {
        return glowparticle;
    }

    public Image getToken() {
        return token;
    }

    public Image getEmber() {
        return ember;
    }

    public Image getBuycard() {
        return buycard;
    }
}
