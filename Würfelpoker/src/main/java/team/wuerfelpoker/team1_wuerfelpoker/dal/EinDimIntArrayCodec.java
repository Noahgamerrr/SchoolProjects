package team.wuerfelpoker.team1_wuerfelpoker.dal;

import javafx.scene.image.ImageView;
import org.bson.BsonReader;
import org.bson.BsonWriter;
import org.bson.codecs.Codec;
import org.bson.codecs.DecoderContext;
import org.bson.codecs.EncoderContext;

public class EinDimIntArrayCodec implements Codec<int[]> {
    @Override
    public int[] decode(BsonReader reader, DecoderContext decoderContext) {
        reader.readStartArray();
        int[] result = new int[7];

        for (int i = 0; i < result.length; i++) {
             result[i] = reader.readInt32();
        }
        reader.readEndArray();
        return result;
    }

    @Override
    public void encode(BsonWriter writer, int[] ints, EncoderContext encoderContext) {
        writer.writeStartArray();

        for (int i = 0; i < ints.length; i++) {
            writer.writeInt32(ints[i]);
        }
        writer.writeEndArray();
    }

    @Override
    public Class<int[]> getEncoderClass() {
        return int[].class;
    }
}
