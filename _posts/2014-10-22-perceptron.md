---
title: A Dumb Brain
tldr: how a kraken learns to classify and saves the world
layout: posting
---

Brains are awesome. I think we can agree on that. Without a brain, we would be only some cells floating around in the mighty oceans -- a jelly- or starfish at most. You couldn't read this. I couldn't write it. We couldn't think, feel, do math, code, sing, compose or even bake some banana bread. Some people would even claim it is the most complex structure in the Universe. I wouldn't disagree. More precisely, my brain wouldn't disagree.

Some brains can be so megalomaniac.

However, the Human's brain has reached a complexity that we even try to understand our brains. Brains are pondering over brains. That's so meta and poetic at the same time. And, since we have these fast but dumb computers we have been trying to emulate them. We have been doing that for quite a long time now. More or less since the 1960s -- with less success. There was even a serious depression going on which is called the [AI winter](http://en.wikipedia.org/wiki/AI_winter). I am not making this up. Actually, there were two winters.

Back then Artificial Intelligence was supposed to be the next big thing. Everyone was talking about it, but then some people realized that this is quite a challenging endeavor with only little progress. Funding was cut. Research was stopped. The most successful "intelligent" algorithms have been statistical methods since then. We are talking about a lot of number crunching here. Very fast. Something a computer is apparently very skilled in, but we wouldn't describe it as "intelligent" at all (whatever this might be).

### Perceptron

Right in the middle of all ambitions were the neural nets -- the most direct approach to mimic the brain -- with its most basic building block the Perceptron. It was as basic as its role model, the neuron. I am not going to try to explain a [neuron](http://en.wikipedia.org/wiki/Neuron) at all (I don't want to be killed by a raging biologist), but I will give you a image you can work with. We are actually talking about a kraken which has two types of tentacles. A bunch of them are called dendrites and the biggest and longest of them is the axon. The dendrites get electrical pulses continuously from surrounding krakens and if they together exceed a certain threshold the axon will fire a pulse to someone else. That's how our brain works. I swear. The only thing is that there are 100 billion kraken in your head. Why does this work? How can we make banana bread with only these? Nobody really knows. That's the mystery of our brains and why we still do not have robots which try to kill us.

<div class="img-container"><img src="/img/2014-10-22-perceptron/kraken.png" alt="The kraken with its dendrites and axon."></img></div>

A Perceptron is exactly like a kraken, just with a touch of math. It gets some input to its dendrite-tentacles, adds them up and outputs +1 if they exceed a threshold and -1 otherwise. That's it. Although a single Perceptron seems to be pretty dumb, it is remarkable what you can achieve with this simple concept.

Let's put this into a formula.

  $$ \sum_{i=1}^{n} w_i x_i > \theta $$

Our kraken gets $$n$$ numbers as input $$x_i$$, multiplies them by some weird $$w_i$$ and tests if the sum is greater than the threshold $$\theta$$. The $$w$$s are actually weights and they are like the diameter of the tentacle which determines how much electricity will be carried. The smaller, the less, and with a negative tentacle diameter -- I don't want to even think about that.

Let us simplify this beast by reducing it to only two input variables $$x_1$$ and $$x_2$$. Furthermore, we will treat the $$>$$ as $$=$$ for now and rearrange everything a little bit.

$$\begin{eqnarray}
w_1 x_1 + & w_2 x_2 & = \theta \\
-\frac{w_1}{w_2} x_1 + & \frac{\theta}{w_2} &= x_2
\end{eqnarray}$$

Does this look somehow familiar? Yes? No? Somewhere from you math class back in the 5th grade? Maybe now?

  $$\underbrace{-\frac{w_1}{w_2}}_{m} \overbrace{x_1}^{x} + \underbrace{\frac{\theta}{w_2}}_{b} = \overbrace{x_2}^{y}$$

Exactly, $$mx + b = y$$ is our beloved linear function. A line in space. And its best property is that it divides the space in two zones -- above and below its frontier. By putting back the inequality sign we can use this to classify any point in either the class above (+1) or below (-1) the function (actually there is literally an infinite number of points on the line -- we will treat them as "above").

<div style="float: right;" class="img-container"><img src="/img/2014-10-22-perceptron/mxb.png" width="300px" alt="Linear function to classify them all"></img></div>

So, a Perceptron is perfect linear classifier. The weights determine which function it represents to separate the space. But how do we get them? Well, this totally depends on what you want to achieve. 

Let me come up with another ridiculous example. You are playing an ancient game that is actually older than chess. It is so old that nobody can remember its name anymore. The board is a two-dimensional field and there exists a line which splits the board in two. You do not know anything about this line except that it is a straight line. From time to time you get some hints. They fall as tokens from the sky on your board and have two colors which indicate where they have landed -- red if it is below the line and green if it is above. Your goal is to approximate the line as good as you can, so if a grey tokens falls down you are able to paint it either red or green. That's it. Have I mentioned that the world explodes with a big _bang_ if you paint it in the wrong color? That is maybe one of the reasons nobody plays it anymore. You are forced to play it anyway -- by some masochistic alien from the delta quadrant.

The time has come. Release the kraken.

### Training

In the beginning we do not know anything at all. Everything we can do is to take a guess. We randomly assign some values to the weights and the threshold. Only after we have got some clues we can correct these weights to give a more educated guess in the future. In machine learning this is called supervised learning. You feed your algorithm with a training set to build a model, which is going to be applied on unseen data to predict its class (or value in case of a regression task -- ehmmm, nevermind).

How you are going to adjust your weights is up to you. You could use a fancy genetic algorithm or any other optimization method, but that feels like taking a sledgehammer to crack a nut. This is actually way easier. Let us take a look on an implementation of the predict function.

{% highlight javascript %}
function predict(input) {
  var sum = 0;
  for(var i=0; i<weights.length; i++) {
    sum += weights[i] * input[i];
  }
  return sum > threshold ? +1 : -1;
};
{% endhighlight %}

So far nothing suprising, but as a amateur kraken tamer and professional developer you might spot the necessary adjustments in your code and not by staring at the function. Let's say that the correct prediction would have been +1 and your kraken predicted -1 instead. Basically this means that your sum was to low and/or the threshold was too high. Conversely, if you predict +1 and it has been -1, your sum was to high and/or the threshold too low. In all the other cases we shouldn't blame our kraken at all.

It is obvious what to do. Even yourself as a 5th grader would raise your hand and say: Add if it is too low and subtract if it is too high. This is what we are going to do.

For every point of the test set we will take a guess with our current kraken and compare it with the expected output by subtracting.

{% highlight javascript %}
var guess = predict(input);
var error = expected - guess;
{% endhighlight %}

If we haven't made any misprediction the error will be 0. In the first case we mentioned above, it is +2 (= +1 - (-1)) so we could just add this value to every weight and subtract it from the treshold. In the other case it is -2 (= -1 - (+1)) which is neat since we can add this to the weights and abstract from the treshold as well -- no special case needed.

A piece of cake.

There are only two small adjustement that are recommended. 

{% highlight javascript %}
// Learn from the input data and the correct output
function learn(input, expected) {
  // Check out what the current perceptron predicts
  var guess = predict(input);
  var error = expected - guess;

  // Adjust all weights
  for(var i=0; i<weights.length; i++) {
    weights[i] += LEARNING_RATE * error * input[i];
  }
  // Also, threshold is important to learn as well
  threshold += LEARNING_RATE * -error;
};
{% endhighlight %}


And don't miss part II with the promising title: How a mob of kraken defeated a nonlineaer attack from outerspace. Coming soon.

<script type="text/javascript"
        src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
