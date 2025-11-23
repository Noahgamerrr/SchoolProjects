package team.wuerfelpoker.team1_wuerfelpoker.dal;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.result.InsertOneResult;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.bson.conversions.Bson;

import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

public class DBManager {
    private static DBManager instance;
    //  private final String connectionString = "mongodb+srv://dbuser:z8QJkUZIqsE2efxS@firstcluster.ogjemno.mongodb.net/?retryWrites=true&w=majority";
    private final String dbName = "WuerfelpokerDatabase";
    private final String collectionName = "Statistics";
    private ConnectionString mongoUri;
    private MongoClient mongoClient = null;
    private MongoDatabase database;
    private MongoCollection<Statistic> StatisticsMongoCollection;
    private MongoClientSettings settings;

    private DBManager() {
        CodecRegistry codecRegistry = fromRegistries(MongoClientSettings.getDefaultCodecRegistry(),
                CodecRegistries.fromCodecs(new EinDimIntArrayCodec(), new EinDimStringArrayCodec()),
                fromProviders(PojoCodecProvider.builder().automatic(true).build()));
        //    mongoUri = new ConnectionString("mongodb+srv://dbuser:z8QJkUZIqsE2efxS@firstcluster.ogjemno.mongodb.net/?retryWrites=true&w=majority");

        mongoUri = new ConnectionString("mongodb://localhost:27017/");
        settings = MongoClientSettings.builder()
                .codecRegistry(codecRegistry)
                .applyConnectionString(mongoUri).build();
    }

    public static DBManager getInstance() {
        if( instance == null ){
            instance = new DBManager();
        }
        return instance;
    }

    private void createConnection(){
        try {
            mongoClient = MongoClients.create(settings);
        } catch (MongoException me) {
            System.err.println("Unable to connect to the MongoDB instance due to an error: " + me);
        }
        database = mongoClient.getDatabase(dbName);
        StatisticsMongoCollection = database.getCollection(collectionName, Statistic.class);
    }

    public List<Statistic> getAllStatistics(){
        List<Statistic> statistics = new LinkedList<>();
        try {
            createConnection();
            for (Statistic s : this.StatisticsMongoCollection.find()) {
                statistics.add(s);
            }
            mongoClient.close();
        }catch( MongoException me){
            System.err.println("Unable to get the statistics: " + me);
        }
        return statistics;
    }

    public Statistic getLastStatistic(){
        List<Statistic> statistics = getAllStatistics();

        return statistics.get(statistics.size()-1);
    }

    public void insertStatistic(Statistic s){
        try {
            createConnection();
            InsertOneResult result = StatisticsMongoCollection.insertOne(s);
            System.out.println("Inserted 1 document with Id: " + result.getInsertedId()+".\n");
            mongoClient.close();
        } catch (MongoException me) {
            System.err.println("Unable to insert one statistic into MongoDB due to an error: " + me);
        }
    }
}
