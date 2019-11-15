install:
	cd game-clients && npm i
	cd game-servers && npm i

start:
	cd game-clients && make start
	cd game-servers && make start

delete:
	cd game-clients && make delete
	cd game-servers && make delete
