#include <stdio.h>
int main() {
    char operator; // Declare variable to store the operator
    double num1, num2, result;

    // Prompt user to enter an operator
    printf("Enter an operator (+, -, *, /): ");
    scanf(" %c", &operator); // Read the operator from user input

    // Prompt user to enter two numbers
    printf("Enter two numbers: ");
    scanf("%lf %lf", &num1, &num2); // Read two numbers from user input

    // Perform operation based on the operator provided
    switch (operator) {
        case '+': // Handle addition
            result = num1 + num2;
            printf("Result: %.2lf\n", result); // Display result
            break;
        case '-': // Handle subtraction
            result = num1 - num2;
            printf("Result: %.2lf\n", result); // Display result
            break;
        case '*': // Handle multiplication
            result = num1 * num2;
            printf("Result: %.2lf\n", result); // Display result
            break;
        case '/': // Handle division
            if (num2 != 0) { // Check for division by zero
                result = num1 / num2;
                printf("Result: %.2lf\n", result); // Display result
            } else {
                printf("Error: Division by zero is not allowed.\n"); // Error message for division by zero
            }
            break;
        default: // Handle invalid operators
            printf("Error: Invalid operator.\n"); // Error message for invalid operator
    }

    return 0; // Indicate successful program termination
}


Each section now has a clear explanation for its purpose, making the program easier to read and understand. Let me know if there's anything more you'd like to refine or improve!
