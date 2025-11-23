package at.htlvillach.translationmgmt.screens

import android.annotation.SuppressLint
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import at.htlvillach.translationmgmt.model.Language
import at.htlvillach.translationmgmt.model.Word
import at.htlvillach.translationmgmt.ui.LanguagesViewModel
import at.htlvillach.translationmgmt.ui.util.Dropdown

@SuppressLint("UnusedMaterial3ScaffoldPaddingParameter")
@Composable
fun WordsScreen(
    languagesViewModel: LanguagesViewModel = viewModel()
) {
    val uiState by languagesViewModel.languagesUIState.collectAsState()
    val openWordDialog = remember { mutableStateOf(false) }
    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {openWordDialog.value = true},
            ) {
                Icon(imageVector = Icons.Filled.Add, contentDescription = "Add")
            }
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Words",
                modifier = Modifier.padding(bottom = 32.dp),
                style = MaterialTheme.typography.headlineLarge
            )
            Text(
                text = "Select Language",
                modifier = Modifier.padding(bottom = 8.dp),
                style = MaterialTheme.typography.headlineSmall
            )
            Dropdown(
                uiState.languagesList,
                languagesViewModel::setCurrentLanguage,
                uiState.currentLanguage
            )
            Surface (
                modifier = Modifier
                    .fillMaxSize(0.8f)
                    .padding(top = 8.dp),
                color = MaterialTheme.colorScheme.outlineVariant,
                shape = MaterialTheme.shapes.large
            ) {
                LazyColumn (
                    modifier = Modifier.padding(16.dp)
                ) {
                    val words = uiState.wordsList.filter {
                        if (uiState.currentLanguage != null)
                            it.language.id == uiState.currentLanguage!!.id
                        else true
                    }
                    val lastIdx = words.lastIndex
                    itemsIndexed(words) {
                        idx, word -> WordsRow(
                            idx,
                            word,
                            lastIdx
                        ) {
                            languagesViewModel.setWord(word)
                            openWordDialog.value = true
                        }
                    }
                }
            }
        }
    }
    when {
        openWordDialog.value -> {
            WordsDialog(
                onDismiss = {
                    openWordDialog.value = false
                    languagesViewModel.resetWord()
                },
                onConfirm = {
                    languagesViewModel.handleWord()
                    openWordDialog.value = false
                    languagesViewModel.resetWord()
                },
                word = uiState.word,
                uiState.languagesList,
                languagesViewModel::setVocable,
                languagesViewModel::setWordLanguage
            )
        }
    }
}

@Composable
fun WordsRow(
    idx: Int,
    word: Word,
    lastIdx: Int,
    onClick: () -> Unit
) {
    Row (
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 8.dp)
            .clickable {
                onClick()
            },
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            word.vocable,
            style = MaterialTheme.typography.headlineSmall,
        )
    }
    if (idx < lastIdx) {
        Spacer(modifier = Modifier.height(8.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
    }
}

@Composable
fun WordsDialog(
    onDismiss: () -> Unit,
    onConfirm: () -> Unit,
    word: Word,
    languages: List<Language>,
    onChangeWord: (String) -> Unit,
    onChangeLanguage: (Language) -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card (
            modifier = Modifier
                .fillMaxWidth()
                .height(240.dp),
            shape = MaterialTheme.shapes.large,
        ) {
            Column (
                modifier = Modifier
                    .padding(16.dp)
            ) {
                Text("Word")
                TextField(
                    value = word.vocable,
                    onValueChange = onChangeWord,
                    label = { Text("Word") },
                )
                Text("Language")
                Dropdown(
                    languages,
                    onClick = { language -> onChangeLanguage(language!!)},
                    word.language,
                    false
                )
                Row (
                    modifier = Modifier
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.padding(8.dp),
                    ) {
                        Text("Dismiss")
                    }
                    TextButton(
                        onClick = onConfirm,
                        modifier = Modifier.padding(8.dp),
                    ) {
                        Text("Confirm")
                    }
                }
            }
        }
    }
}