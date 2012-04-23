#include <stdio.h>

int twice(int n)
{
    return 2 * n;
}

int add(int a, int b)
{
	return a + b;
}

void map(int *input, int *output, int size, int(*fp)(int))
{
	if (size > 0) {
		*output = fp(input[0]);
		map(input+1, output+1, size-1, fp);
	}
}

int reduce(int acc, int *data, int size, int(*fp)(int, int))
{
	if (size < 1) {
		return acc;
	} else {
		return reduce(fp(acc, *data), data+1, size-1, fp);
	}
}


int main(int argc, char *argv[])
{
	int size = 5;
	int input[] = {1, 2, 3, 4, 5};
	int output[size];

	map(input, output, size, twice);

	printf("Mapped:\n");
	int i = 0;
	for (i = 0; i < size; i++) {
		printf("%d->%d ", input[i], output[i]);
	}
	printf("\n");

	int r = reduce(0, output, size, add);
	printf("Reduced: %d\n", r);
}