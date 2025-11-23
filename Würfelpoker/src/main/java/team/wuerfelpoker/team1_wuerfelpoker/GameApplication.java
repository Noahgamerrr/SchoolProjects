package team.wuerfelpoker.team1_wuerfelpoker;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import team.wuerfelpoker.team1_wuerfelpoker.music.Music;

import java.io.IOException;

public class GameApplication extends Application {


    public static int screenHeight = 960;
    public static int screenWidth = 540;
    @Override
    public void start(Stage stage) throws IOException {

        FXMLLoader fxmlLoader = new FXMLLoader(GameApplication.class.getResource("hello-view.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), screenHeight, screenWidth);
        stage.setTitle("Wuerfelpoker");
        stage.setScene(scene);
        stage.setResizable(false);
        stage.show();
        // example code remove if you get it
        var m = Music.getInstance();
        m.hardStartInf("children_of_the_city.mp3");

        /*new java.util.Timer().schedule(
                new java.util.TimerTask() { // just for testing purposes don't mind it
                    @Override
                    public void run() {
                        m.start("land_of_confusion.mp3");
                    }
                },
                5000
        );*/

    }

    public static void main(String[] args) {
        launch();
    }
}