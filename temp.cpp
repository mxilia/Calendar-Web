#include <iostream>
#include <string>
#include <map>
#include <vector>
#include <climits>
using namespace std;

int main()
{
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }
    map<int, int> freq;
    for (auto x : arr)
    {
        freq[x]++;
    }
    int mx = INT_MIN;
    int num_with_max_freq;

    for (auto &p : freq)
    {
        if (p.second > mx)
        {
            mx = p.second;
            num_with_max_freq = p.first;
        }
    }
    cout << num_with_max_freq << endl;

    return 0;
}