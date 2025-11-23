package team.wuerfelpoker.team1_wuerfelpoker.dal;

import org.bson.BsonReader;
import org.bson.BsonWriter;
import org.bson.codecs.Codec;
import org.bson.codecs.DecoderContext;
import org.bson.codecs.EncoderContext;

public class EinDimStringArrayCodec implements Codec<String[]> {
    @Override
    public String[] decode(BsonReader reader, DecoderContext decoderContext) {
        reader.readStartArray();
        String[] result = new String[2];

        for (int i = 0; i < result.length; i++) {
            result[i] = reader.readString();
        }
        reader.readEndArray();
        return result;
    }


    @Override
    public void encode(BsonWriter writer, String[] strings, EncoderContext encoderContext) {
        writer.writeStartArray();

        for (int i = 0; i < strings.length; i++) {
            writer.writeString(strings[i]);
        }
        writer.writeEndArray();
    }

    @Override
    public Class<String[]> getEncoderClass() {
        return String[].class;
    }
}
