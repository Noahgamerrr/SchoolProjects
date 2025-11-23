package at.htlvillach.noaharsic.translationservice.controller;

import at.htlvillach.noaharsic.translationservice.model.Language;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("Test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class LanguageControllerTest {
    @Autowired
    private MockMvc mvc;

    @Test
    void getAll() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/languages"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[*].identifier").isNotEmpty());
    }

    @Test
    void getById() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/languages/1"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifier").value("German"));
    }

    @Test
    void getByIdNotExist() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.get("http://localhost:8080/languages/10"))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    public static String asJsonString(final Object object) {
        System.out.println(object);
        try {
            return new ObjectMapper().writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void create() throws Exception {
        Language language = new Language();
        language.setIdentifier("Spanish");
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/languages")
                .content(asJsonString(language))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identifier").value("Spanish"));
    }

    @Test
    void createNoIdentifier() throws Exception {
        Language language = new Language();
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/languages")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createInvalidIdentifier() throws Exception {
        Language language = new Language();
        language.setIdentifier("");
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/languages")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update() throws Exception {
        Language language = new Language();
        language.setId(1);
        language.setIdentifier("Spanish");
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/languages/1")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.identifier").value("Spanish"));
    }

    @Test
    void updateNotFound() throws Exception {
        Language language = new Language();
        language.setId(10);
        language.setIdentifier("Spanish");
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/languages/10")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateNoIdentifier() throws Exception {
        Language language = new Language();
        language.setId(1);
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/languages/1")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInvalidIdentifier() throws Exception {
        Language language = new Language();
        language.setIdentifier("");
        language.setId(1);
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/languages/1")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateInvalidId() throws Exception {
        Language language = new Language();
        language.setId(1);
        language.setIdentifier("Spanish");
        this.mvc.perform(MockMvcRequestBuilders.put("http://localhost:8080/languages/2")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete() throws Exception {
        Language language = new Language();
        language.setIdentifier("Spanish");
        this.mvc.perform(MockMvcRequestBuilders.post("http://localhost:8080/languages")
                        .content(asJsonString(language))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identifier").value("Spanish"));

        this.mvc.perform(MockMvcRequestBuilders.delete("http://localhost:8080/languages/4"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteHasWords() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.delete("http://localhost:8080/languages/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteNotFound() throws Exception {
        this.mvc.perform(MockMvcRequestBuilders.delete("http://localhost:8080/languages/10"))
                .andExpect(status().isNotFound());
    }
}
