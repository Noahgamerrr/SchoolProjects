module team.wuerfelpoker.team1_wuerfelpoker {
    requires javafx.controls;
    requires javafx.fxml;
    requires org.mongodb.bson;
    requires org.mongodb.driver.core;
    requires org.mongodb.driver.sync.client;


    opens team.wuerfelpoker.team1_wuerfelpoker to javafx.fxml;
    requires javafx.media;
    exports team.wuerfelpoker.team1_wuerfelpoker;
    opens team.wuerfelpoker.team1_wuerfelpoker.dal to javafx.fxml;
    exports team.wuerfelpoker.team1_wuerfelpoker.dal;
    opens team.wuerfelpoker.team1_wuerfelpoker.app to javafx.fxml;
    exports team.wuerfelpoker.team1_wuerfelpoker.app;
    opens team.wuerfelpoker.team1_wuerfelpoker.util to javafx.fxml;
    exports team.wuerfelpoker.team1_wuerfelpoker.util;
}