FROM node:7.0.0
RUN mkdir /opt/tools
COPY validate.sh /opt/tools/
RUN npm install ajv -g 
RUN npm install ajv-cli -g 
COPY validator /opt/tools/validator
RUN cd /opt/tools/validator; npm install -g fiware-model-validator
WORKDIR /opt/datamodels
CMD ["validate", "-p DataModel", "-w ignore", "-i [common-schema.json,geometry-schema.json]"]