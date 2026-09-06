package com.prince_of_nigeria.famropqmmszhbxkd6jagg6ijox

import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.my.target.ads.MyTargetView
import com.my.target.common.AdSize

class MyTargetViewManager : SimpleViewManager<MyTargetView>() {
    override fun getName() = "MyTargetView"

    override fun createViewInstance(reactContext: ThemedReactContext): MyTargetView {
        return MyTargetView(reactContext).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }
    }

    @ReactProp(name = "slotId")
    fun setSlotId(view: MyTargetView, slotId: String) {
        view.setSlotId(slotId.toIntOrNull() ?: return)
    }

    @ReactProp(name = "adSize")
    fun setAdSize(view: MyTargetView, adSize: String?) {
        when (adSize) {
            "320x50" -> view.setAdSize(AdSize.ADSIZE_320x50)
            "300x250" -> view.setAdSize(AdSize.ADSIZE_300x250)
            "728x90" -> view.setAdSize(AdSize.ADSIZE_728x90)
            else -> view.setAdSize(AdSize.ADSIZE_ADAPTIVE)
        }
    }

    override fun onDropViewInstance(view: MyTargetView) {
        view.destroy()
        super.onDropViewInstance(view)
    }
}