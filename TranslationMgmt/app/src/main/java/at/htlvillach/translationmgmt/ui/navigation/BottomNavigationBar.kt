package at.htlvillach.translationmgmt.ui.navigation

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.navigation.NavController
import at.htlvillach.translationmgmt.R

@Composable
fun BottomNavigationBar(navController: NavController){
    val selectedNavigationIndex = rememberSaveable { mutableStateOf(0) }
    val navigationItems = listOf(
        NavigationItem(
            title = "Languages",
            icon = ImageVector.vectorResource(R.drawable.languages),
            route = Screen.Languages.route,
        ),
        NavigationItem(
            title = "Words",
            icon = ImageVector.vectorResource(R.drawable.words),
            route = Screen.Words.route,
        ),
        NavigationItem(
            title = "Assignments",
            icon = ImageVector.vectorResource(R.drawable.assignments),
            route = Screen.Assignment.route,
        )
    )
    NavigationBar (
        containerColor = MaterialTheme.colorScheme.background,
    ) {
        navigationItems.forEachIndexed { index, item ->
            NavigationBarItem(
                selected = index == selectedNavigationIndex.value,
                onClick = {
                    selectedNavigationIndex.value = index
                    navController.navigate(item.route)
                },
                icon = {
                    Icon(item.icon, contentDescription = item.title)
                },
                label = {
                    Text(
                        text = item.title,
                        color = if (index == selectedNavigationIndex.value) MaterialTheme.colorScheme.onBackground else Color.Gray
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.surface,
                    indicatorColor = MaterialTheme.colorScheme.primary,
                )
            )
        }
    }
}