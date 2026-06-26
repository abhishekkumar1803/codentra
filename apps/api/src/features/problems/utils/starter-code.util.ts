const PYTHON_STARTER = `import sys

def solve():
    data = sys.stdin.read().strip().split()
    if len(data) < 2:
        return
    a, b = int(data[0]), int(data[1])
    print(a + b)

if __name__ == "__main__":
    solve()
`;

const CPP_STARTER = `#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long a, b;
    if (cin >> a >> b) {
        cout << a + b << "\\n";
    }
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
        if (sc.hasNextLong()) {
            long a = sc.nextLong();
            long b = sc.hasNextLong() ? sc.nextLong() : 0;
            System.out.println(a + b);
        }
    }
}
`,
  JAVASCRIPT: `const fs = require('fs');

function solve() {
  const input = fs.readFileSync(0, 'utf8').trim();
  const parts = input.split(/\\s+/).map(Number);
  if (parts.length >= 2) {
    console.log(parts[0] + parts[1]);
  }
}

solve();
`,
};
