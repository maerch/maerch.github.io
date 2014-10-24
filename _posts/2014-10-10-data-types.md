---
title: Land Of Types
tldr: history of types from the dinosaurs up to now
layout: posting
---

At the beginning was darkness. Bits and bytes were flipped manually -- literally by hand and sometimes with a magnetic needle. These were tedious days, but after a while a light began to shine. The first assembler was emerging and the developer's life had never been so easy. Some things in life totally depend on your perspective.

You had your memory assigned by your granny in the backyard of your operating system. This was your realm, your bunch of bits and only you were responsible for getting any meaning into this. The 8 bits of code at the address `0x800234`? Back in the dark age before C it was totally up to you. Could be a char or the beginning of an integer. Or a flying spaghetti monster. Back than kids had a vivid imagination.

### Static typing

Than came C and we were enlightened. Suddenly our programming language helped us with this burden. If you tell your compiler you want something to be a char, it will be a char and your compiler will help you to deal with it as any decent char should be treated.

{% highlight C %}
#include<stdio.h>

int main()
{
  // Take this char and prosper
  char c = 'a';
  return 0;
}
{% endhighlight %}

Static typing was born.

Information about the meaning of some bits -- the type of data -- was *stored in your code*. Nowhere else. You looked on your code and saw the type. The compiler looked as well, and saw it even better.

### Dynamic typing

But if there is something static, there has to be something revolutionary as dynamic typing as well. And there is.

{% highlight javascript %}
var c = 'a';
{% endhighlight %}

This line belongs to a successful creature of the web. JavaScript. If you come from the land of the dinosaurs and C, you will look closely at this line of code and you will probably ask yourself: "That's confusing! Why are they calling their char a var?".

Actually, they don't. We have successfully passed the times of chars and are in the area of strings. But the more fascinating thing is that if there would be a char, it would be also called a var. The same for integers. And doubles. And floats. You name it. We are finally in the land of _dynamic typing_.

But does this also mean we are back in the dark age of machine code and assembler where nobody knows what these bits actually mean? No. This information is hidden from you and added as additional information beside your actual data. Inside your holy memory it looks something like that.

<div class="img-container"><img src="/img/2014-10-10-data-types/types-in-mem.png" alt="How dynamically types are represeted in memory"></img></div>

In contrast to static typing where this information is stored in your source code and is therefore checked during compile time, it is now stored internally and will be checked during runtime. 

### Why should I care?

Statically typed languages are more like your teacher from the last century who hit you with the ruler on your typing fingers every time you are doing something wrong with your type. On the one hand this gives you safety (and throbbing finger tips), but on the other hand you feel patronized. You want freedom. You want flexibility. You want to tell you teacher, "Stop hitting me. I know what I am doing. Trust me. Everything is gonna be alright! You will see!"

Of course you do not always know what you are doing. Your system will crash from time to time with type errors spilled around the floor. But that is the price for your newly gained flexibility -- a world where you can pass values to methods which will handle the type with care. We live in an anti-authoritarian age. And so a lot of modern languages are actually dynamic typed ones.

### Weak and strong typing

Although C is a totally statically typed language, it still gives you a lot of freedom. How does this fit into the picture of an authoritarian teacher? Imagine that: What happens if you are actually stronger than your teacher. What if you could grab the ruler with one hand and tell your teacher to relax. What if you have the power to bend and move pointers to objects and circumvent the type system as you like -- and thus make a implicit or explicit conversion of types as you go. This means you are a weakly typed language like C, while Java is a more strongly typed statically language.

The distinction between weak and strong type systems is not always as clear as between static and dynamic systems. Good indicators of weak systems are e.g. casts between different types which are not directly related by any inheritance chain. This is often correlates with a lot of "WAT?" moments. There is no better language to demonstrate this than JavaScript. I leave you with this line of code to ponder on. Beware: This can be a disturbing line of code if you are coming from the land of Java.

{% highlight javascript %}
var a = 3 + "a";
{% endhighlight %}

