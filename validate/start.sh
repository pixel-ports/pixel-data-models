#!/bin/bash
docker run -it --rm -v ${PWD}:/app -v ${PWD}/../specs:/app/data -w /app node /bin/bash
