#include <stdio.h>

#define SIZE 5

/*
  improvements thanks to Suncho
  http://nathansuniversity.com/vanilla/discussion/comment/1019#Comment_1019
*/

int twice(int n)
{
    return 2 * n;
}

int add(int a, int b)
{
	return a + b;
}

void map(const int *input, int *output, int size, int(*fp)(int))
{
	while (size-- > 0) {
		*output++ = fp(*input++);
	}
}

int reduce(int acc, int *data, int size, int(*fp)(int, int))
{
	while (size-- > 0) {
		acc = fp(acc, *data++);
	}
	return acc;
}

int main(int argc, char *argv[])
{
	int input[SIZE] = {1, 2, 3, 4, 5};
	int output[SIZE];
	int i = 0;
	int r = 0;

	map(input, output, SIZE, twice);

	printf("%s", "Mapped:\n");
	i = 0;
	for (i = 0; i < SIZE; i++) {
		printf("%d->%d ", input[i], output[i]);
	}
	printf("\n");

	r = reduce(0, output, SIZE, add);
	printf("Reduced: %d\n", r);

	return 0;
}