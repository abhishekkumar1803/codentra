const PYTHON_STARTER = `# Write your solution below
import sys

def solve():
    # Read input from stdin and print the answer
    pass

if __name__ == "__main__":
    solve()
`;

const CPP_STARTER = `#include <iostream>
using namespace std;

int main() {
    // Read input and print the answer
    return 0;
}
`;

export const DEFAULT_STARTER_CODE = {
  PYTHON: PYTHON_STARTER,
  CPP: CPP_STARTER,
  JAVA: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read input and print the answer
    }
}
`,
  JAVASCRIPT: `const fs = require('fs');

function solve() {
  // Read input and print the answer
}

solve();
`,
};
