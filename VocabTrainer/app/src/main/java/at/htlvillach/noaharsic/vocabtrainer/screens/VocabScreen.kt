package at.htlvillach.noaharsic.vocabtrainer.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import at.htlvillach.noaharsic.vocabtrainer.ui.VocabViewModel
import at.htlvillach.noaharsic.vocabtrainer.ui.theme.Grey700

@Composable
fun VocabScreen(
    vocabViewModel: VocabViewModel,
) {
    val uiState by vocabViewModel.vocabUiState.collectAsState()
    var response by remember { mutableStateOf("") }
    var responseColor by remember { mutableStateOf(Color(0xFF00c800)) }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(8.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Row {
            Text(
                "Word to translate: ",
                color = Grey700,
            )
            Text(
                uiState.wordList[uiState.currentIndex]
                    .vocable
            )
        }
        Text(
            "Your answer: ",
            color = Grey700,
        )
        TextField(
            value = uiState.guess,
            onValueChange = vocabViewModel::setGuess,
        )
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            TextButton(
                onClick = {
                    if (vocabViewModel.checkGuess()) {
                        response = "Great Job!"
                        responseColor = Color(0xFF00c800)
                    }
                    else {
                        response = "Sorry, your answer does not match: ${vocabViewModel.getTranslations()}!"
                        responseColor = Color(0xFFc80000)
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                ),
                content = {
                    Text("Check")
                },
                modifier = Modifier.width(90.dp)
            )
        }
        Text(
            response,
            color = responseColor,
        )
        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            TextButton(
                onClick = {
                    vocabViewModel.setNextWord()
                    response = ""
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                ),
                content = {
                    Text("Next")
                },
                modifier = Modifier.width(90.dp)
            )
        }
    }
}