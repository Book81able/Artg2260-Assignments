//Array of Object Variables
var ston = [];
var leng = 0;
//Game State Set
var gameState = "start";
//Stone in Play
var aimingStone;
//Target Set
var xyTarget = [];
//Scores
var scoreValue = 0;
var highScore = 0;
//Round set
var ends = 0;

function setup() {
  can = createCanvas(200,600);
  can.parent("sketch-holder");
  angleMode(DEGREES);
  rectMode(CENTER);
}

function draw(){
  background(255);
  groundElements();
  if(gameState == "start"){
  	startScreen();
  }else if(gameState == "aiming"){
 	aiming();
  }else if(gameState == "curling"){
  	curling();
  }else if(gameState == "sliding"){
  	sliding();
  }
  if(gameState != "start"){
  	target();
  	text("Score: " + scoreValue + " Ends: " + ends, 5, 10);
  	text("High Score: " + highScore , 5, 20);
  }
}

//To Start the Game
function keyReleased(){
	if(gameState == "start" && keyCode == 32){
		gameState = "aiming";
		var firstStone = new Stone();
		ston.push(firstStone);
		xyTarget = [random(10,200),random(10,300)];
		return false;
	}
}

function keyPressed(){
	return false;
}

//To inititate curling
function mouseReleased(){
	if(gameState == "aiming" && mouseY<450){
		aimingStone.speedSet();
		gameState = "curling";
	}
}

//Sets up the background
function groundElements(){
	noStroke();
	fill(15, 84, 196);
	ellipse(width/2,100,160);
	fill(255);
	ellipse(width/2,100,120);
	fill(196, 15, 15)
	ellipse(width/2,100,80);
	fill(255);
	ellipse(width/2,100,40);
	stroke(200,0,0);
	line(0,450,width,450);
}

//When GameState = start
function startScreen(){
	fill(0);
	noStroke();
	textAlign(CENTER);
  text("Press Space to Start",width/2,300);
  text("High Score: " + highScore,width/2,320);
  text("Click where you want the stone to go",width/2,340);
  text("USe A and D to add curl to the stone",width/2,360);
}

function aiming(){
	aimingStone = ston[leng];
	aimingStone.aiming();
	for(var i = 0; i<=leng; i++){
  		ston[i].display(i);
  	}
}

function curling(){
	aimingStone.turning();
	for(var i = 0; i<=leng; i++){
  		ston[i].display(i);
  	}
}

function sliding(){
	aimingStone.move();
	for(var i = leng; i>=0; i--){
  		ston[i].display(i);
  	}
}

//Target Setup
function target(){
	fill(0);
	rect(xyTarget[0],xyTarget[1],20,5);
	rect(xyTarget[0],xyTarget[1],5,20);
	noStroke();
	textAlign(LEFT);
}

//Calculates Scores
function scoring(){
	var long = abs(xyTarget[0]-aimingStone.x);
	var tall = abs(xyTarget[1]-aimingStone.y);
	var protoScore = sqrt(sq(long)+sq(tall));
	var refinedScore = round(map(protoScore,0,100,10000,0));
	if(refinedScore<0){
		refinedScore = 0;
	}
	scoreValue += refinedScore;
	xyTarget = [random(10,200),random(10,300)];
}

//Reset the loop
function nextStone(){
	scoring();
	if(ends >= 5){
		if(highScore<scoreValue){
			highScore = scoreValue;
		}
		ends = 0;
		scoreValue = 0;
		ston = [];
		leng = 0;
		gameState = "start"
	}else{
		let newStone = new Stone();
		ston.push(newStone);
		leng++;
		aimingStone = ston[leng];
		ends++;
		gameState = "aiming";
	}
}

class Stone{
	constructor(){
		this.x = width/2;
		this.y = 550;
		this.xDist = mouseX;
		this.yDist = mouseY;
		this.xSpeed = .11;
		this.ySpeed = .11;
		this.friction = .994
		this.curlRate = 0;
		this.roateSpeed = 0;
	}
	//Show the Stones
	display(colorSet){
		if(gameState == "sliding"){
			this.rotateSpeed = -this.curlRate*30
		}
		noStroke();
		if(colorSet%2 ==0){
			fill(196, 15, 15);
		}else{
			fill(247, 243, 14);
		}
		translate(this.x,this.y);
		ellipse(0,0,30);
		fill(200);
		rotate(this.rotateSpeed);
		rect(0,0,4,20);
		rotate(-this.rotateSpeed);
		translate(-this.x,-this.y);
	}
	//Move the Stones after they cross the hog line
	move(){
		this.y += this.ySpeed;
		this.x += this.xSpeed;
		this.xSpeed += this.curlRate/10000;
		this.ySpeed *= this.friction;
		this.xSpeed *= this.friction;
		this.curlRate*=this.friction;
		if(this.xSpeed<.05 && this.xSpeed>-.05 && this.curlRate<2.5 && this.curlRate> -2.5){
			this.xSpeed = 0;
		}
		if(this.ySpeed>-.1 && this.ySpeed<.1){
			this.ySpeed = 0;
		}
		if(aimingStone == this && this.xSpeed == 0 && this.ySpeed == 0){
			nextStone();
		}
	}
	//Aim the stone 
	aiming(){
		this.xDist=mouseX;
		this.yDist=mouseY;
		fill(255,0 );
		stroke(0);
		line(this.x,this.y,this.xDist,this.yDist);
		ellipse(this.xDist,this.yDist,20);
	}
	//Movement before the hog line
	turning(){
		this.y += this.ySpeed/2;
		this.x += this.xSpeed/2;
		this.ySpeed *= .997;
		this.xSpeed *= .997;
		if(this.y<450){
			gameState = "sliding";
		}
		if(keyIsDown(65)){
			this.curlRate--;
		}else if(keyIsDown(68)){
			this.curlRate++;
		}
		this.spinDirection(this.x,this.y,this.curlRate)
	}
	speedSet(){
		this.xSpeed = map(mouseX,0,width,-.7,.7);
		this.ySpeed = map(mouseY,0,height,-3.44,.4)
	}
	spinDirection(x,y,theta){
	if(theta>0){
		for(var i = 0; i<=theta;i++){
			var xEnd = 50*cos(90-i) + x;
			var yEnd = y-50*sin(90-i);
			stroke(0,200,0);
			line(x,y,xEnd,yEnd);
		}
	}else if(theta<0){
		for(var i = 0;i>=theta;i--){
			var xEnd = 50*cos(90-i) + x;
			var yEnd = y-50*sin(90-i);
			stroke(0,200,0);
			line(x,y,xEnd,yEnd);
		}
	}
}
}