---
title: A Dumb Brain
tldr: how a kraken learns to classify and saves the world
layout: posting
---

Brains are awesome. I think we can agree on that. Without a brain, we would be only some cells floating around in the mighty oceans -- a jelly- or starfish at most. You couldn't read this. I couldn't write it. We couldn't think, feel, do math, code, sing, compose or even bake some banana bread. Some people would even claim it is the most complex structure in the Universe. I wouldn't disagree. More precisely, my brain wouldn't disagree.

Also, some brains can be megalomaniac.

However, the Human's brain has reached a complexity that we even try to understand our brains. Brains are pondering over brains. That's so meta and poetic at the same time. And, since we have these fast but dumb computers we have been trying to emulate brains. We have been doing that for quite a long time now. More or less since the 1960s -- with less success, though. There was even a serious depression going on which is called the [AI winter](http://en.wikipedia.org/wiki/AI_winter). I am not making this up. Actually, there were two winters.

Back then, Artificial Intelligence was supposed to be the next big thing. Everyone was talking about it, but then some people realized that this is quite a challenging endeavor with only little progress. Funding was cut. Research was stopped. The most successful "intelligent" algorithms have been statistical methods since then. We are talking about a lot of number crunching here. Very fast. Something a computer is apparently very skilled in, but we wouldn't describe it as "intelligent" at all (whatever this might be).

### Perceptron

Right in the middle of all brainy ambitions were the neural nets -- the most direct approach to mimic the brain -- with its most basic building block the Perceptron. It was as basic as its role model, the neuron. I am not going to try to explain a [neuron](http://en.wikipedia.org/wiki/Neuron) at all (I don't want to be killed by a raging biologist), but I will give you a image you can work with. We are actually talking about a kraken which has two types of tentacles. A bunch of them are called dendrites and the biggest and longest of them is the axon. The dendrites get electrical pulses continuously from surrounding krakens and if they together exceed a certain threshold the axon will fire a pulse to someone else. That's how our brain works. I swear. The only thing is that there are 100 billion kraken in your head. Why does this work? How can we make banana bread with only these? Nobody really knows. That's the mystery of our brains and why we still do not have robots which try to kill us.

<div class="img-container"><img src="{{site.url}}/img/2014-10-22-perceptron/kraken.png" alt="The kraken with its dendrites and axon."></img></div>

A Perceptron is exactly like a kraken, just with a touch of math. It gets some input to its dendrite-tentacles, adds them up and outputs +1 if they exceed a threshold and -1 otherwise. That's it. Although a single Perceptron seems to be pretty dumb, it is remarkable what you can achieve with this simple concept.

Let's put this into a formula.

  $$ \sum_{i=1}^{n} w_i x_i > \theta $$

Our kraken gets $$n$$ numbers as input $$(x_1, \cdots, x_n)$$, multiplies them by some weird $$w_i$$ and tests if the sum is greater than the threshold $$\theta$$. The $$w$$s are actually weights and they are like the diameter of the tentacle which determines how much electricity will be carried. The smaller the weight, the less impact this particular tentacle has on the sum, and with a negative tentacle diameter -- I don't want to even think about that.

If you have studied some math, you have maybe spotted something very simliar. Have you ever seen anything like this?

  $$ \sum_{i=1}^{n} w_i x_i + b = 0 $$

<div class="img-container float-right"><img src="{{site.url}}/img/2014-10-22-perceptron/wxb.png" width="300px" alt="Linear function to classify them all"></img></div>

This is a special form to represent a hyperplane in space. Since not everybody can think in multiple dimensions like Stephen Hawking, we are going to choose the special case of $$n=2$$, which is representing a line on a two-dimensional plane. There is also an easy way to visualize this formula. The vector $$\vec{w} = (w_1, w_2)$$ is perpendicular to our line, so by pointing somewhere in space we determine the slope and by adding a bias we manipulate the intersection between the line and the axes. Every point $$\vec{x} = (x_1, x_2)$$ that satisfies this equation is excatly on our line. The other interesting property is that every point which yields a positive value instead zero on the left side of the equation, is above it and vice versa for the negative case.

If you look closely, you might see that our Perceptron isn't so much different. Rearrange the formula, think of $$\theta$$ as $$-b$$, replace $$>$$ with $$=$$ and you will see that our Perceptron is nothing else than a line in space.

  $$ w_1 x_1 + w_2 x_2 - \theta  = 0 $$

By the way: In case you feel too unfamiliar with this representation, you can easily rearrange it to the more common "slope-intercept" form $$mx + b = y$$. Feel free to do this in your spare time. I will give you a hint how it will look in the end, though.

$$\underbrace{-\frac{w_1}{w_2}}_{m} \overbrace{x_1}^{x} + \underbrace{\frac{\theta}{w_2}}_{b} = \overbrace{x_2}^{y}$$ 

So basically, our two-armed kraken is a linear classifier by exploiting the "intersting property" of this hyperplane representation. The weights and the threshold determine which function it represents to separate the space into two classes.


<div class="img-container float-left"><img src="{{site.url}}/img/2014-10-22-perceptron/dangerous-games.png" width="300px" alt="Playing ancient, but danagerous games"></img></div>
Now the more important question: So what?

Let me come up with another ridiculous, but tremendously helpful and life-saving example. You are playing an ancient game that is actually older than chess and go together. It is so old that nobody can remember its name anymore. The board is a two-dimensional field and there exists a line which splits the board in two. You do not know anything about this line except that it is a straight line. From time to time you get some hints. They fall as tokens from the sky on your board and in addition to its position they have one of two colors which indicates where the token has landed -- red if it is below the line and green if it is above. Your goal is to approximate the line as good as you can, so if a grey tokens falls down you are able to paint it either red or green. That's it. Have I mentioned that the world explodes with a big _bang_ if you paint it in the wrong color? That is maybe one of the reasons nobody plays it anymore. You are forced to play it anyway -- by some masochistic alien from the delta quadrant.

But no worries. Your time has come to use your secret weapon. 

Release the kraken.

### Training

In the beginning we do not know anything at all. Everything we can do is to take a guess. We randomly assign some values to the weights and the threshold. Only after we have got some clues we can correct these weights to give a more educated guess in the future. In machine learning this is called supervised learning. You feed your algorithm with a training set to build a model, which is going to be applied on unseen data to predict its class (or real numbers in case of a regression task -- but, ehmmm, nevermind).

How you are going to adjust your weights is up to you. You are the kraken tamer. You could use a fancy genetic algorithm or any other optimization method, but that feels like taking a sledgehammer to crack a nut. It is actually way easier. For every $$\vec{x} = (x_1, \cdots, x_n)$$ with its expected output and the current guess of the prediction, we change $$\vec{w} = (w_1, \cdots, w_n)$$ like this:

  $$ w_i = w_i + \eta \cdot \underbrace{(expected - guess)}_{error} \cdot x_i $$

Basically we add the current training point to the weights. This causes the vector $$\vec{w}$$ to point slightly more in the direction of the misclassified point. At least for the case you have to move the line "up". In case you have to move the line down, you have to subtract the vectors. This is actually done by the error term, which is either positive or negative in the respective cases. Additionally, if the error is zero -- i.e. our kraken was absolutely right with its decision -- we do not change anything. Neat. Everything we want. But what is this strange $$\eta$$ doing over there.

Usually this is a relatively small constant -- like $$0.01$$ or $$0.001$$. The concept behind this is called "smoothness" and is quite common in a lot learning and optimization algorithms. Without this constant our kraken would be jumpy and would overshoot fairly often. In general you are going to be more precise if you do a lot of small steps instead a few big ones, which brings us to the next part.

You will not apply this learning rule once for every point. In fact several iterations over the whole training set are necessary to train a master of a kraken. Repetition is the core concept of every learning -- whether kraken or humanoid. In case you have forgotten it already due to the math stuff: We are talking here about brains!

I might hear you asking: When shall we stop? Will it run forever? Excellent questions. If (and only if) the "real" function we have to learn is linear, some crazy math can proof that this rule will converge -- i.e. stop after a finite number of iterations with 0 errors on the training set. Of course we can never proof that we will never make an error on unseen data since we have never seen the "real" function. Now you can see why these aliens are notorious masochist. However, according to the seen data, we have done the best we could do to save the world.

If you ever come up against the nonlinear sequel of this game, don't miss part II of this posting: "How a mob of kraken defeated a nonlineaer attack from outerspace." Coming soon.

And if you are not completely convinced by this approach, I set up a [simulation ]({{ site.url }}/static/vpercp) of this game where you can safely play around without the world being at stake. Add random data to the canvas, press learn and move the slider to explore the kraken's state after each iteration. And do not forget: orange points mean death to all of us!

<script type="text/javascript"
        src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
